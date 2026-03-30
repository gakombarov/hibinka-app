import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from "@mui/material";
import { Modal } from "../../shared/components/ui/Modal";
import { tripsApi, TripCreate } from "../../api/trips";
import { TripResponse } from "@shared/types/api";

interface TripFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tripToEdit?: TripResponse | null;
}

export const TripFormModal: React.FC<TripFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  tripToEdit,
}) => {
  const [formData, setFormData] = useState<TripCreate>({
    trip_date: "",
    departure_time: "",
    departure_location: "",
    arrival_location: "",
    passenger_count: 1,
    total_amount: 0,
    paid_amount: 0,
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (tripToEdit) {
        setFormData({
          trip_date: tripToEdit.trip_date,
          departure_time: tripToEdit.departure_time.substring(0, 5),
          departure_location: tripToEdit.departure_location,
          arrival_location: tripToEdit.arrival_location,
          passenger_count: tripToEdit.passenger_count || 1,
          total_amount: Number(tripToEdit.total_amount) || 0,
          paid_amount: Number(tripToEdit.paid_amount) || 0,
          notes: tripToEdit.notes || "",
        });
      } else {
        setFormData({
          trip_date: new Date().toISOString().split("T")[0],
          departure_time: "12:00",
          departure_location: "",
          arrival_location: "",
          passenger_count: 1,
          total_amount: 0,
          paid_amount: 0,
          notes: "",
        });
      }
      setError(null);
    }
  }, [open, tripToEdit]);

  const handleChange =
    (field: keyof TripCreate) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async () => {
    if (
      !formData.trip_date ||
      !formData.departure_time ||
      !formData.departure_location ||
      !formData.arrival_location
    ) {
      setError("Заполните обязательные поля маршрута и времени");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        ...formData,
        passenger_count: Number(formData.passenger_count),
        total_amount: Number(formData.total_amount),
        paid_amount: Number(formData.paid_amount),
      };

      if (tripToEdit) {
        await tripsApi.update(tripToEdit.id, payload);
      } else {
        await tripsApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Произошла ошибка при сохранении");
    } finally {
      setIsLoading(false);
    }
  };

  const debt =
    (Number(formData.total_amount) || 0) - (Number(formData.paid_amount) || 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tripToEdit ? "Редактировать поездку" : "Новая поездка"}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Typography variant="subtitle2" color="primary">
          Маршрут и Время
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Дата"
              type="date"
              fullWidth
              value={formData.trip_date}
              onChange={handleChange("trip_date")}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Время"
              type="time"
              fullWidth
              value={formData.departure_time}
              onChange={handleChange("departure_time")}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Откуда"
              fullWidth
              value={formData.departure_location}
              onChange={handleChange("departure_location")}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Куда"
              fullWidth
              value={formData.arrival_location}
              onChange={handleChange("arrival_location")}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Количество пассажиров"
              type="number"
              fullWidth
              value={formData.passenger_count}
              onChange={handleChange("passenger_count")}
            />
          </Grid>
        </Grid>

        <Divider />

        <Typography variant="subtitle2" color="primary">
          Финансы
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Итого к оплате (₽)"
              type="number"
              fullWidth
              value={formData.total_amount}
              onChange={handleChange("total_amount")}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Внесенный аванс (₽)"
              type="number"
              fullWidth
              value={formData.paid_amount}
              onChange={handleChange("paid_amount")}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            p: 1.5,
            bgcolor: debt > 0 ? "error.light" : "success.light",
            color: debt > 0 ? "error.dark" : "success.dark",
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Остаток (Долг): {debt} ₽
          </Typography>
        </Box>

        <TextField
          label="Заметки (для диспетчера)"
          multiline
          rows={2}
          fullWidth
          value={formData.notes}
          onChange={handleChange("notes")}
        />

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ mt: 1 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Сохранить"
          )}
        </Button>
      </Box>
    </Modal>
  );
};
