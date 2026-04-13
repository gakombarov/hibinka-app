import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Stack,
  Alert,
  Chip,
  Divider,
  Checkbox,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { AppDispatch, RootState } from "../../store/store";
import {
  fetchBookingDetails,
  updateBookingThunk,
  cancelBookingThunk,
  clearCurrentBooking,
} from "../../store/bookingsSlice";
import { confirmBookingToTrip } from "../../api/bookings";

export const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    currentBooking: booking,
    loading,
    error,
  } = useSelector((state: RootState) => state.bookings);

  const [editData, setEditData] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasTrailer, setHasTrailer] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchBookingDetails(id));
    return () => {
      dispatch(clearCurrentBooking());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (booking) {
      setEditData({ ...booking });
    }
  }, [booking]);

  if (loading && !editData)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Загрузка данных...</Typography>
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  if (!editData)
    return <Typography sx={{ p: 3 }}>Заявка не найдена</Typography>;

  const isNew = editData.status === "NEW";
  const isCancelled = editData.status === "CANCELLED";

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await dispatch(
        updateBookingThunk({ id: editData.id, data: editData }),
      ).unwrap();
      alert("Изменения в черновике сохранены");
    } catch (e) {
      alert("Ошибка при сохранении");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFormTrips = async () => {
    const count = editData.is_round_trip ? 2 : 1;
    if (
      !window.confirm(
        `Будет сформировано рейсов: ${count}. Данные заявки будут заморожены. Продолжить?`,
      )
    )
      return;

    try {
      setIsUpdating(true);
      await confirmBookingToTrip(editData.id, {
        total_amount: editData.total_amount,
        paid_amount: editData.paid_amount,
        status: "CONFIRMED",
        has_trailer: hasTrailer, // Добавлено поле has_trailer
        notes: editData.notes,
      });
      alert("Рейсы успешно созданы");
      navigate("/dashboard/trips");
    } catch (e) {
      alert("Ошибка при формировании рейсов");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Вы уверены? Заявка будет отменена, а связанные рейсы удалены из активного расписания.",
      )
    )
      return;
    try {
      setIsUpdating(true);
      await dispatch(cancelBookingThunk(editData.id)).unwrap();
      alert("Заявка отменена");
    } catch (e) {
      alert("Ошибка при отмене");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        {/* ШАПКА */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Button onClick={() => navigate(-1)} sx={{ mb: 1 }}>
              ← К списку заявок
            </Button>
            <Typography variant="h4" fontWeight="bold">
              Заявка #{editData.id.slice(-4).toUpperCase()}
            </Typography>
          </Box>
          <Chip
            label={editData.status}
            color={
              editData.status === "NEW"
                ? "info"
                : editData.status === "CONFIRMED"
                  ? "success"
                  : "error"
            }
            sx={{ fontWeight: "bold", height: 40, px: 2, fontSize: "1rem" }}
          />
        </Stack>

        <Grid container spacing={3}>
          {/* ЛЕВАЯ КОЛОНКА: ДЕТАЛИ ИЗ ФОРМЫ */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              {/* Клиент */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Контактные данные
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Имя"
                        fullWidth
                        value={editData.customer?.first_name || ""}
                        disabled
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Телефон"
                        fullWidth
                        value={editData.customer?.phone || ""}
                        disabled
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Email"
                        fullWidth
                        value={booking?.customer?.email || "не указан"}
                        disabled
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Рейс ТУДА */}
              <Card
                variant="outlined"
                sx={{ borderLeft: 6, borderColor: "primary.main" }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Маршрут "Туда"
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Откуда"
                        fullWidth
                        value={editData.desired_trip_location}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            desired_trip_location: e.target.value,
                          })
                        }
                        disabled={!isNew}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Куда"
                        fullWidth
                        value={editData.arrival_location}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            arrival_location: e.target.value,
                          })
                        }
                        disabled={!isNew}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <DatePicker
                        label="Дата поездки"
                        format="DD.MM.YYYY"
                        value={dayjs(editData.desired_trip_date)}
                        onChange={(val) =>
                          setEditData({
                            ...editData,
                            desired_trip_date: val?.format("YYYY-MM-DD"),
                          })
                        }
                        disabled={!isNew}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TimePicker
                        label="Время отправления"
                        ampm={false}
                        value={dayjs(
                          `2000-01-01T${editData.desired_departure_time}`,
                        )}
                        onChange={(val) =>
                          setEditData({
                            ...editData,
                            desired_departure_time: val?.format("HH:mm:ss"),
                          })
                        }
                        disabled={!isNew}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Обратный рейс */}
              <Card
                variant="outlined"
                sx={{
                  borderLeft: 6,
                  borderColor: editData.is_round_trip
                    ? "secondary.main"
                    : "divider",
                }}
              >
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editData.is_round_trip || false}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            is_round_trip: e.target.checked,
                          })
                        }
                        disabled={!isNew}
                      />
                    }
                    label={
                      <Typography fontWeight="bold">
                        Нужен обратный рейс
                      </Typography>
                    }
                  />
                  {editData.is_round_trip && (
                    <Grid container spacing={2} mt={1}>
                      <Grid size={{ xs: 6 }}>
                        <DatePicker
                          label="Дата обратно"
                          format="DD.MM.YYYY"
                          value={
                            editData.return_date
                              ? dayjs(editData.return_date)
                              : null
                          }
                          onChange={(val) =>
                            setEditData({
                              ...editData,
                              return_date: val?.format("YYYY-MM-DD"),
                            })
                          }
                          disabled={!isNew}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TimePicker
                          label="Время обратно"
                          ampm={false}
                          value={
                            editData.return_time
                              ? dayjs(`2000-01-01T${editData.return_time}`)
                              : null
                          }
                          onChange={(val) =>
                            setEditData({
                              ...editData,
                              return_time: val?.format("HH:mm:ss"),
                            })
                          }
                          disabled={!isNew}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>

              {/* Детали */}
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        label="Пассажиров"
                        type="number"
                        fullWidth
                        value={
                          editData.passenger_count === 0
                            ? ""
                            : editData.passenger_count
                        }
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            passenger_count:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                        onFocus={(e) => e.target.select()}
                        disabled={!isNew}
                      />
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <TextField
                        label="Багаж"
                        fullWidth
                        placeholder="Описание багажа..."
                        value={editData.luggage_description || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            luggage_description: e.target.value,
                          })
                        }
                        disabled={!isNew}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Комментарий / Заметки"
                        fullWidth
                        multiline
                        rows={2}
                        value={editData.notes || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, notes: e.target.value })
                        }
                        disabled={!isNew}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* ПРАВАЯ КОЛОНКА: ДЕНЬГИ И КНОПКИ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2} position="sticky" top={20}>
              <Card
                elevation={4}
                sx={{
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "primary.light",
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Финансы
                  </Typography>
                  <TextField
                    label="Итого к оплате (₽)"
                    fullWidth
                    type="number"
                    value={
                      editData.total_amount === 0 ? "" : editData.total_amount
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        total_amount:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    onFocus={(e) => e.target.select()}
                    disabled={!isNew}
                    sx={{ mb: 2, bgcolor: "white" }}
                  />

                  <TextField
                    label="Уже оплачено (₽)"
                    fullWidth
                    type="number"
                    value={
                      editData.paid_amount === 0 ? "" : editData.paid_amount
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        paid_amount:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    onFocus={(e) => e.target.select()}
                    disabled={!isNew}
                    sx={{ mb: 2, bgcolor: "white" }}
                  />

                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="subtitle1">Остаток (Долг):</Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={
                        editData.total_amount - editData.paid_amount > 0
                          ? "error.main"
                          : "success.main"
                      }
                    >
                      {editData.total_amount - editData.paid_amount} ₽
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Stack spacing={2}>
                {isNew && (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSave}
                      disabled={isUpdating}
                    >
                      Сохранить правки
                    </Button>
                    {/* Добавлен чекбокс для прицепа */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={hasTrailer}
                          onChange={(e) => setHasTrailer(e.target.checked)}
                        />
                      }
                      label="Нужен прицеп для багажа"
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      onClick={handleFormTrips}
                      disabled={isUpdating || editData.total_amount <= 0}
                      sx={{ height: 60, fontWeight: "bold" }}
                    >
                      Сформировать рейсы
                    </Button>
                  </>
                )}

                {!isCancelled && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    Отменить заявку
                  </Button>
                )}

                {isCancelled && <Alert severity="error">Заявка отменена</Alert>}
                {!isNew && !isCancelled && (
                  <Alert severity="success">
                    Заявка подтверждена. Рейсы созданы.
                  </Alert>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
