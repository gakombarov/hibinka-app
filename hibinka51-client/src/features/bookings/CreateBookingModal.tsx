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
import { createAdminBooking } from "../../api/bookings";

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

export const CreateBookingModal = ({ open, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    customer_name: "",
    customer_phone: "+7 ",
    source: "PHONE",
    desired_trip_date: dayjs().add(1, "day").format("YYYY-MM-DD"),
    desired_departure_time: "12:00:00",
    desired_trip_location: "",
    arrival_location: "",
    passenger_count: 1,
    is_round_trip: false,
    return_date: dayjs().add(2, "day").format("YYYY-MM-DD"),
    return_time: "12:00:00",
    total_amount: 0,
    paid_amount: 0,
    notes: "",
  });

  const handleSubmit = async () => {
    if (!form.customer_name || form.customer_phone.length < 10) {
      alert("Введите корректное имя и телефон");
      return;
    }
    try {
      setLoading(true);
      await createAdminBooking(form);
      onSuccess();
      onClose();
    } catch (e) {
      alert("Ошибка при создании");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Modal open={open} onClose={onClose} title="Новая заявка (Диспетчер)">
        <Box sx={{ mt: 1, p: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Имя клиента"
                fullWidth
                size="small"
                value={form.customer_name}
                onChange={(e) =>
                  setForm({ ...form, customer_name: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Телефон"
                fullWidth
                size="small"
                value={form.customer_phone}
                onChange={(e) =>
                  setForm({ ...form, customer_phone: e.target.value })
                }
                InputProps={{ inputComponent: PhoneMaskCustom as any }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Источник"
                fullWidth
                size="small"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                <MenuItem value="PHONE">Телефон</MenuItem>
                <MenuItem value="MESSENGER">Мессенджер (TG/VK)</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Откуда"
                fullWidth
                size="small"
                value={form.desired_trip_location}
                onChange={(e) =>
                  setForm({ ...form, desired_trip_location: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Куда"
                fullWidth
                size="small"
                value={form.arrival_location}
                onChange={(e) =>
                  setForm({ ...form, arrival_location: e.target.value })
                }
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <DatePicker
                label="Дата туда"
                format="DD.MM.YYYY"
                value={dayjs(form.desired_trip_date)}
                onChange={(v) =>
                  setForm({
                    ...form,
                    desired_trip_date: v?.format("YYYY-MM-DD") || "",
                  })
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TimePicker
                label="Время"
                ampm={false}
                value={dayjs(`2000-01-01T${form.desired_departure_time}`)}
                onChange={(v) =>
                  setForm({
                    ...form,
                    desired_departure_time: v?.format("HH:mm:ss") || "",
                  })
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_round_trip}
                    onChange={(e) =>
                      setForm({ ...form, is_round_trip: e.target.checked })
                    }
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="bold">
                    Нужен обратный рейс
                  </Typography>
                }
              />
            </Grid>

            {form.is_round_trip && (
              <>
                <Grid size={{ xs: 6 }}>
                  <DatePicker
                    label="Дата обратно"
                    format="DD.MM.YYYY"
                    value={dayjs(form.return_date)}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        return_date: v?.format("YYYY-MM-DD") || "",
                      })
                    }
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TimePicker
                    label="Время обратно"
                    ampm={false}
                    value={dayjs(`2000-01-01T${form.return_time}`)}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        return_time: v?.format("HH:mm:ss") || "",
                      })
                    }
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary">
                Финансы
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Итого (₽)"
                type="number"
                fullWidth
                size="small"
                value={form.total_amount === 0 ? "" : form.total_amount}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  setForm({
                    ...form,
                    total_amount:
                      e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Аванс (₽)"
                type="number"
                fullWidth
                size="small"
                value={form.paid_amount === 0 ? "" : form.paid_amount}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paid_amount:
                      e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Заметки"
                fullWidth
                multiline
                rows={2}
                size="small"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  Создать
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
