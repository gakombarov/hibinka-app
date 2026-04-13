import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Grid,
  Divider,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { AppDispatch } from "../../store/store";
import { confirmBookingThunk } from "../../store/bookingsSlice";
import { Booking } from "../../shared/types/api";

interface Props {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
};

export const ConfirmBookingModal: React.FC<Props> = ({
  open,
  booking,
  onClose,
}) => {
  const [total, setTotal] = useState<number | "">("");
  const [paid, setPaid] = useState<number | "">(0);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [hasTrailer, setHasTrailer] = useState(false);

  useEffect(() => {
    if (open) {
      setTotal("");
      setPaid(0);
    }
  }, [open, booking]);

  const handleConfirm = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      await dispatch(
        confirmBookingThunk({
          id: booking.id,
          data: {
            total_amount: Number(total),
            paid_amount: Number(paid),
            has_trailer: hasTrailer,
            notes: booking.luggage_description
              ? `Багаж: ${booking.luggage_description}`
              : undefined,
          },
        }),
      ).unwrap();
      onClose();
    } catch (error) {
      console.error("Ошибка при подтверждении:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Диспетчеризация заявки</DialogTitle>
      <DialogContent dividers>
        {/* Информационный блок*/}
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Клиент
              </Typography>
              <Typography variant="body1">
                <b>{booking.customer?.first_name || "Без имени"}</b>
              </Typography>
              <Typography variant="body2">{booking.customer?.phone}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Маршрут
              </Typography>
              <Typography variant="body1">
                <b>
                  {booking.desired_trip_location} → {booking.arrival_location}
                </b>
              </Typography>
              <Typography variant="body2">
                {formatDate(booking.desired_trip_date)} в{" "}
                {booking.desired_departure_time}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Пассажиры / Багаж
              </Typography>
              <Typography variant="body2">
                {booking.passenger_count} чел. |{" "}
                {booking.luggage_description || "Без багажа"}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <FormControlLabel
          control={
            <Checkbox
              checked={hasTrailer}
              onChange={(e) => setHasTrailer(e.target.checked)}
            />
          }
          label="Этому рейсу потребуется прицеп"
        />

        {/* Форма ввода стоимости */}
        <Stack spacing={3}>
          <Typography variant="body2" color="primary">
            Укажите стоимость. После подтверждения машины будут автоматически
            созданы в Журнале поездок.
          </Typography>

          <TextField
            label="Итоговая сумма (₽)"
            type="number"
            fullWidth
            required
            value={total}
            onChange={(e) =>
              setTotal(e.target.value === "" ? "" : Number(e.target.value))
            }
          />

          <TextField
            label="Внесена предоплата (₽)"
            type="number"
            fullWidth
            value={paid}
            onChange={(e) =>
              setPaid(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={loading || total === "" || total <= 0}
        >
          Подтвердить и Сформировать
        </Button>
      </DialogActions>
    </Dialog>
  );
};
