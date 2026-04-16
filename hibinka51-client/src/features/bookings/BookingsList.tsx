import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { AppDispatch, RootState } from "../../store/store";
import { fetchBookingsList } from "../../store/bookingsSlice";
import { CreateBookingModal } from "./CreateBookingModal";
import { Booking } from "../../shared/types/api";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "NEW":
      return { label: "Новая", color: "info" as const };
    case "CONFIRMED":
      return { label: "Сформирована", color: "primary" as const };
    case "CANCELLED":
      return { label: "Отменена", color: "error" as const };
    case "COMPLETED":
      return { label: "Завершена", color: "success" as const };
    default:
      return { label: status, color: "default" as const };
  }
};

export const BookingsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    list: bookings,
    loading,
    error,
  } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(fetchBookingsList({ skip: 0, limit: 100 }));
  }, [dispatch]);

  const groupedBookings = useMemo(() => {
    if (!bookings) return {};

    const groups: Record<string, Booking[]> = {};
    bookings.forEach((booking) => {
      const date = booking.desired_trip_date || "Дата не указана";
      if (!groups[date]) groups[date] = [];
      groups[date].push(booking);
    });

    const sortedGroups: Record<string, Booking[]> = {};
    Object.keys(groups)
      .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
      .forEach((key) => {
        sortedGroups[key] = groups[key].sort((b1, b2) =>
          b1.desired_departure_time.localeCompare(b2.desired_departure_time),
        );
      });

    return sortedGroups;
  }, [bookings]);

  if (loading && bookings.length === 0)
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;
  if (error)
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 1, md: 3 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Входящие заявки
        </Typography>
        <Button
          variant="contained"
          onClick={() => setIsCreateModalOpen(true)}
          sx={{ borderRadius: "8px" }}
        >
          + Ручная заявка
        </Button>
      </Stack>

      {Object.keys(groupedBookings).length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={5}>
          Нет заявок
        </Typography>
      ) : (
        Object.entries(groupedBookings).map(([dateStr, dayBookings]) => {
          const isToday = dateStr === dayjs().format("YYYY-MM-DD");
          const displayDate = dayjs(dateStr)
            .locale("ru")
            .format("D MMMM, dddd");

          return (
            <Accordion
              key={dateStr}
              defaultExpanded={isToday}
              disableGutters
              elevation={0}
              sx={{
                mb: 2,
                background: "transparent",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: isToday ? "primary.light" : "grey.200",
                  borderRadius: "12px",
                  color: isToday ? "white" : "inherit",
                  mb: 1,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {isToday ? "Сегодня " : ""}
                  {displayDate}
                </Typography>
                <Chip
                  label={dayBookings.length}
                  size="small"
                  sx={{
                    ml: 2,
                    fontWeight: "bold",
                    bgcolor: "white",
                    color: "black",
                  }}
                />
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                {dayBookings.map((booking) => {
                  const badge = getStatusBadge(booking.status);
                  const debt =
                    (Number(booking.total_amount) || 0) -
                    (Number(booking.paid_amount) || 0);

                  return (
                    <Paper
                      key={booking.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                        },
                      }}
                      onClick={() =>
                        navigate(`/dashboard/bookings/${booking.id}`)
                      }
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ minWidth: 60, textAlign: "center" }}>
                          <Typography
                            variant="h6"
                            fontWeight="900"
                            color="primary"
                          >
                            {booking.desired_departure_time?.slice(0, 5)}
                          </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            mb={0.5}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {booking.desired_trip_location} →{" "}
                              {booking.arrival_location}
                            </Typography>
                            <Chip
                              label={badge.label}
                              color={badge.color}
                              size="small"
                              sx={{ fontWeight: "bold", fontSize: "11px" }}
                            />
                            {booking.is_round_trip && (
                              <Chip
                                label="Туда-Обратно"
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            )}
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={2}
                            color="text.secondary"
                          >
                            <Typography variant="caption" fontWeight="bold">
                              👤{" "}
                              {booking.customer?.first_name || "Имя не указано"}{" "}
                              ({booking.passenger_count} чел.)
                            </Typography>
                            <Typography variant="caption">
                              📞 {booking.customer?.phone || "Без телефона"}
                            </Typography>
                          </Stack>
                        </Box>

                        <Box
                          sx={{
                            textAlign: "right",
                            display: { xs: "none", sm: "block" },
                          }}
                        >
                          {debt > 0 ? (
                            <Typography
                              variant="body2"
                              color="error"
                              fontWeight="bold"
                            >
                              Долг: {debt} ₽
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              color="success.main"
                              fontWeight="bold"
                            >
                              Оплачено
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Всего: {booking.total_amount} ₽
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      {/* модалка создания заявок */}
      <CreateBookingModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => dispatch(fetchBookingsList({ skip: 0, limit: 100 }))}
      />
    </Box>
  );
};
