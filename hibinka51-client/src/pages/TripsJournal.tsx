import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { fetchAdminTrips } from "../api/trips";
import { TripResponse } from "@shared/types/api";

export const TripsJournal = () => {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAdminTrips();
        setTrips(data);
        setError(null);
      } catch (err) {
        setError("Не удалось загрузить журнал поездок");
      } finally {
        setIsLoading(false);
      }
    };
    loadTrips();
  }, []);

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  const groupedTrips = trips.reduce(
    (acc, trip) => {
      const date = trip.trip_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(trip);
      return acc;
    },
    {} as Record<string, TripResponse[]>,
  );

  const sortedDates = Object.keys(groupedTrips).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Журнал поездок
        </Typography>
        <Button variant="contained" color="primary" size="small">
          + Добавить рейс
        </Button>
      </Box>

      {sortedDates.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Журнал пока пуст.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sortedDates.map((date) => {
            const dayTrips = groupedTrips[date];
            dayTrips.sort((a, b) =>
              a.departure_time.localeCompare(b.departure_time),
            );

            return (
              <Accordion
                key={date}
                defaultExpanded={date === sortedDates[0]}
                sx={{
                  borderRadius: "12px !important",
                  "&:before": { display: "none" },
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {/* ШАПКА ДНЯ */}
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.dark"
                    >
                      {date}
                    </Typography>
                    <Badge
                      badgeContent={dayTrips.length}
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{ bgcolor: "grey.50", p: { xs: 1, sm: 2 } }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {dayTrips.map((trip) => {
                      const totalAmount = Number(trip.total_amount) || 0;
                      const paidAmount = Number(trip.paid_amount) || 0;
                      const debt = totalAmount - paidAmount;

                      const isPaid = debt <= 0 && totalAmount > 0;
                      const isCompleted = trip.status === "COMPLETED";

                      return (
                        <Paper
                          key={trip.id}
                          elevation={0}
                          sx={{
                            border: "1px solid",
                            borderColor: "grey.300",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          {/* ВЕРХНЯЯ ПАНЕЛЬ: Время и Статусы */}
                          <Box
                            sx={{
                              bgcolor: isCompleted ? "success.50" : "grey.100",
                              p: 1.5,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderBottom: "1px solid",
                              borderColor: "grey.200",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary.main"
                              >
                                {trip.departure_time.substring(0, 5)}
                              </Typography>

                              {/* Индикаторы "Выполнено" и "Оплачено" */}
                              <Box sx={{ display: "flex", gap: 1 }}>
                                {isCompleted ? (
                                  <Chip
                                    size="small"
                                    icon={<CheckCircleOutlineIcon />}
                                    label="Выполнено"
                                    color="success"
                                  />
                                ) : (
                                  <Chip
                                    size="small"
                                    label={
                                      trip.display_status || "Запланировано"
                                    }
                                    variant="outlined"
                                  />
                                )}
                                {isPaid && (
                                  <Chip
                                    size="small"
                                    label="Оплачено"
                                    color="success"
                                    variant="outlined"
                                    sx={{ bgcolor: "white" }}
                                  />
                                )}
                              </Box>
                            </Box>

                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* ОСНОВНОЕ ТЕЛО КАРТОЧКИ (Сетка данных) */}
                          <Box sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              {/* КОЛОНКА 1: Маршрут и Клиент */}
                              <Grid item xs={12} md={4}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Откуда — Куда
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight="bold"
                                  sx={{ mb: 1 }}
                                >
                                  {trip.departure_location} —{" "}
                                  {trip.arrival_location}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Заказчик / Клиент
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {/* TODO: Сюда потом выведем реальное имя из БД */}
                                  <span
                                    style={{
                                      color: "#9e9e9e",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Данные клиента (скоро)
                                  </span>
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Пассажиров:{" "}
                                  <Box
                                    component="span"
                                    fontWeight="bold"
                                    color="text.primary"
                                  >
                                    {trip.passenger_count || 0}
                                  </Box>
                                </Typography>
                                {trip.luggage_description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Багаж:{" "}
                                    <Box
                                      component="span"
                                      fontWeight="bold"
                                      color="text.primary"
                                    >
                                      {trip.luggage_description}
                                    </Box>
                                  </Typography>
                                )}
                              </Grid>

                              {/* КОЛОНКА 2: Исполнители (Плейсхолдеры) */}
                              <Grid item xs={12} md={4}>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    bgcolor: "grey.50",
                                    borderRadius: 1,
                                    height: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Назначенный водитель
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      mb: 1.5,
                                      color: "text.secondary",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {/* TODO: Заменить на trip.driver_id когда прикрутим водителей */}
                                    Не назначен
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Назначенный транспорт
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "text.secondary",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Не назначен
                                  </Typography>
                                </Box>
                              </Grid>

                              {/* КОЛОНКА 3: Бухгалтерия */}
                              <Grid item xs={12} md={4}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                    h: "100%",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Цена (Итого):
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                    >
                                      {totalAmount} ₽
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Внесенный аванс:
                                    </Typography>
                                    <Typography variant="body2">
                                      {paidAmount} ₽
                                    </Typography>
                                  </Box>

                                  <Divider sx={{ my: 0.5 }} />

                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color={
                                        debt > 0 ? "error.main" : "text.primary"
                                      }
                                    >
                                      Сумма к оплате (Долг):
                                    </Typography>
                                    <Typography
                                      variant="h6"
                                      fontWeight="bold"
                                      color={
                                        debt > 0 ? "error.main" : "success.main"
                                      }
                                    >
                                      {debt > 0 ? `${debt} ₽` : "0 ₽"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
