import { useState } from "react";
import { Box, Grid, TextField, Button, Stack, FormControlLabel, Switch, Typography } from "@mui/material";
import { Modal } from "../../shared/components/ui/Modal";
import { createOrganization, updateOrganization } from "../../api/customers";
import { Organization } from "@shared/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organization?: Organization | null;
}

export const OrganizationModal = ({ open, onClose, onSuccess, organization }: Props) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: organization?.name ?? "",
    notes: organization?.notes ?? "",
    is_active: organization?.is_active ?? true,
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (organization) await updateOrganization(organization.id, form);
      else await createOrganization(form);
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={organization ? "Редактировать организацию" : "Новая организация"}>
      <Box sx={{ mt: 1, p: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField label="Название" fullWidth size="small" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Комментарии" fullWidth size="small" multiline rows={3}
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />}
              label={<Typography variant="body2" fontWeight="bold">Активная</Typography>}
            />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
                {organization ? "Сохранить" : "Создать"}
              </Button>
              <Button variant="outlined" fullWidth onClick={onClose}>Отмена</Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};
