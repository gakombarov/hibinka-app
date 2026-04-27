import { useState } from "react";
import { Box, Grid, TextField, Button, Stack, MenuItem, FormControlLabel, Switch, Typography } from "@mui/material";
import { Modal } from "../../shared/components/ui/Modal";
import { createDriver, updateDriver } from "../../api/drivers";
import { DriverProfile, DriverStatus } from "@shared/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  driver?: DriverProfile | null;
}

const STATUS_LABELS: Record<DriverStatus, string> = {
  READY: "Готов",
  BUSY: "Занят",
  OFF_DUTY: "Не на смене",
};

export const DriverModal = ({ open, onClose, onSuccess, driver }: Props) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    call_sign: driver?.call_sign ?? "",
    phone: driver?.phone ?? "",
    is_external: driver?.is_external ?? false,
    status: driver?.status ?? "OFF_DUTY" as DriverStatus,
  });

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (driver) await updateDriver(driver.id, form);
      else await createDriver(form);
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={driver ? "Редактировать водителя" : "Новый водитель"}>
      <Box sx={{ mt: 1, p: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField label="Позывной" fullWidth size="small" value={form.call_sign}
              onChange={e => set("call_sign", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Телефон" fullWidth size="small" value={form.phone}
              onChange={e => set("phone", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField select label="Статус" fullWidth size="small" value={form.status}
              onChange={e => set("status", e.target.value)}>
              {(Object.keys(STATUS_LABELS) as DriverStatus[]).map(s => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={form.is_external} onChange={e => set("is_external", e.target.checked)} />}
              label={<Typography variant="body2" fontWeight="bold">Внешний партнёр</Typography>}
            />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
                {driver ? "Сохранить" : "Создать"}
              </Button>
              <Button variant="outlined" fullWidth onClick={onClose}>Отмена</Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};
