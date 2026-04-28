import React, { useState, forwardRef } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  MenuItem,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { IMaskInput } from "react-imask";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { Modal } from "../../shared/components/ui/Modal";
import { createVehicle, updateVehicle } from "../../api/vehicles";

export enum VehicleCategory {
    BUS = "BUS",
    MINIBUS = "MINIBUS"
}

const PhoneMaskCustom = forwardRef<HTMLInputElement, any>(
  function PhoneMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="+7 (#00) 000-00-00"
        definitions={{ "#": /[1-9]/ }}
        inputRef={ref}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  },
);

export const CreateVehicleModal = ({ vehicle, open, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    alias: vehicle?.alias || '',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    license_plate: vehicle?.license_plate || '',
    capacity: vehicle?.capacity || 0,
    category: vehicle?.category || VehicleCategory.BUS,
    is_active: vehicle?.is_active || false,
  });

  const handleSubmit = async () => {
    // if (!form.customer_name || form.customer_phone.length < 10) {
    //   alert("Введите корректное имя и телефон");
    //   return;
    // }
    try {
      setLoading(true);
      if (vehicle) {
        await updateVehicle({...form, id: vehicle.id});
      } else {
        await createVehicle(form);
      }
      onSuccess();
      onClose();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Modal open={open} onClose={onClose} title={vehicle ? "Редактировать транспорт" : "Новый транспорт"}>
        <Box sx={{ mt: 1, p: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Псевдоним"
                fullWidth
                size="small"
                value={form.alias}
                onChange={(e) =>
                  setForm({ ...form, alias: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Марка"
                fullWidth
                size="small"
                value={form.brand}
                onChange={(e) =>
                  setForm({ ...form, brand: e.target.value })
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Модель"
                fullWidth
                size="small"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Госномер"
                fullWidth
                size="small"
                value={form.license_plate}
                onChange={(e) =>
                  setForm({ ...form, license_plate: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Кол-во пассажирских мест"
                fullWidth
                size="small"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                select
                label="Категория"
                fullWidth
                size="small"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <MenuItem value={VehicleCategory.BUS}>Автобус</MenuItem>
                <MenuItem value={VehicleCategory.MINIBUS}>Минибус</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="bold">
                    Активный
                  </Typography>
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {vehicle ? 'Сохранить' : 'Создать'}
                </Button>
                <Button variant="outlined" fullWidth onClick={onClose}>
                  Отмена
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};
