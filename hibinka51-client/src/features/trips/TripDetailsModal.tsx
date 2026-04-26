import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Grid,
  Divider,
} from "@mui/material";
import { Trip, TripStatus } from "../../shared/types/api";
import { tripsApi } from "../../api/trips";

interface Props {
  trip: Trip | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const TripDetailsModal: React.FC<Props> = ({
  trip,
  open,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<Partial<Trip>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trip) {
      setFormData({
        status: trip.status,
        has_trailer: trip.has_trailer || false,
        notes: trip.notes || "",
        passenger_count: trip.passenger_count || 0,
      });
    }
  }, [trip]);

  if (!trip) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSubmit: any = { ...formData };
      Object.keys(dataToSubmit).forEach((key) => {
        if (dataToSubmit[key] === "") {
          dataToSubmit[key] = null;
        }
      });

      await tripsApi.update(trip.id, dataToSubmit);

      onUpdate?.();
      onClose();
    } catch (error: any) {
      console.error("Ошибка при обновлении рейса:", error);
      alert(
        `Не удалось сохранить: ${error.response?.data?.detail?.[0]?.msg || "ошибка сети"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Управление рейсом</DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Статус рейса"
              value={formData.status || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as TripStatus,
                })
              }
            >
              <MenuItem value="PLANNED">Запланирован</MenuItem>
              <MenuItem value="IN_PROGRESS">В пути</MenuItem>
              <MenuItem value="COMPLETED">Завершен</MenuItem>
              <MenuItem value="CANCELLED">Отменен</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Пассажиров в этом авто"
              value={
                formData.passenger_count === 0 ? "" : formData.passenger_count
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passenger_count:
                    e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
              onFocus={(e) => e.target.select()}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(formData.has_trailer)}
                  onChange={(e) =>
                    setFormData({ ...formData, has_trailer: e.target.checked })
                  }
                />
              }
              label="Назначить прицеп для этого авто"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Заметки (для водителя)"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
