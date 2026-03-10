import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import type { RootState } from "../store/store";
import { tripsApi, type Trip, type TripCreate } from "../api/trips";

import { Button } from "@shared/components/ui/Button";
import { InputField } from "@shared/components/ui/InputField";
import { Modal } from "@shared/components/ui/Modal";

const formatDateToRU = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
};

export const TripsJournal = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const token = useSelector((state: RootState) => state.auth.token);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TripCreate>({
    defaultValues: {
      trip_date: dayjs().format("YYYY-MM-DD"),
      departure_time: "12:00",
      departure_location: "",
      arrival_location: "",
      passenger_count: 1,
      planned_amount: 0,
      is_regular: false,
    },
  });

  const fetchTrips = async () => {
    if (!token) return;
    try {
      const data = await tripsApi.getAllTrips(0, 100);
      setTrips(data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [token]);

  const onSubmit = async (data: TripCreate) => {
    if (!token) return;
    try {
      await tripsApi.createTrip(token, data);
      setIsAddModalOpen(false);
      reset();
      fetchTrips();
    } catch (error) {
      console.error("Ошибка при создании:", error);
      alert("Не удалось создать поездку.");
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Box sx={{ p: 4, height: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Журнал поездок
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Управление регулярными рейсами и трансферами
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setIsAddModalOpen(true)}
            sx={{ display: "flex", gap: 1 }}
          >
            <AddIcon fontSize="small" /> Добавить поездку
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{ borderRadius: "12px", boxShadow: 2 }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Время</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Маршрут</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Тип</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Пассажиры</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Водитель</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Нет поездок
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip) => (
                  <TableRow key={trip.id} hover>
                    <TableCell>{formatDateToRU(trip.trip_date)}</TableCell>
                    <TableCell>{trip.departure_time.substring(0, 5)}</TableCell>
                    <TableCell>
                      {trip.departure_location} — {trip.arrival_location}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trip.is_regular ? "Регулярный" : "Трансфер"}
                        color={trip.is_regular ? "primary" : "default"}
                        variant={trip.is_regular ? "filled" : "outlined"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{trip.passenger_count}</TableCell>
                    <TableCell>
                      {trip.driver_id ? (
                        "Назначен"
                      ) : (
                        <Typography color="error" variant="body2">
                          Не назначен
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trip.display_status || trip.status}
                        color={
                          trip.status === "PLANNED"
                            ? "warning"
                            : trip.status === "COMPLETED"
                              ? "success"
                              : "info"
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Modal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Новая поездка"
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ py: 2, display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name="trip_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Дата поездки"
                      format="DD.MM.YYYY"
                      value={dayjs(field.value)}
                      onChange={(newValue) => {
                        if (newValue)
                          field.onChange(newValue.format("YYYY-MM-DD"));
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name="departure_time"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TimePicker
                      label="Время отправления"
                      ampm={false}
                      format="HH:mm"
                      value={
                        field.value ? dayjs(`2000-01-01T${field.value}`) : null
                      }
                      onChange={(newValue) => {
                        if (newValue) field.onChange(newValue.format("HH:mm"));
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name="departure_location"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <InputField
                      {...field}
                      label="Откуда"
                      placeholder="Мурманск"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name="arrival_location"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <InputField {...field} label="Куда" placeholder="Кировск" />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name="passenger_count"
                  control={control}
                  render={({ field }) => (
                    <InputField {...field} label="Пассажиры" type="number" />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name="planned_amount"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      {...field}
                      label="Стоимость (₽)"
                      type="number"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              isLoading={isSubmitting}
            >
              Сохранить поездку
            </Button>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};
