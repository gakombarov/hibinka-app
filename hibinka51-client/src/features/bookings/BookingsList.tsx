import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

import { AppDispatch, RootState } from "../../store/store";
import { fetchBookingsList } from "../../store/bookingsSlice";
import { CreateBookingModal } from "./CreateBookingModal";
import { Booking } from "../../shared/types/api";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "NEW":
      return { label: "Новая", color: "info" as const };
    case "CONFIRMED":
      return { label: "Сформирована", color: "success" as const };
    case "CANCELLED":
      return { label: "Отменена", color: "error" as const };
    case "COMPLETED":
      return { label: "Завершена", color: "default" as const };
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
    const grouped = bookings.reduce(
      (acc, booking) => {
        const date = booking.desired_trip_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(booking);
        return acc;
      },
      {} as Record<string, Booking[]>,
    );

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    return { grouped, sortedDates };
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
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Входящие заявки</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Ручная заявка
        </Button>
      </Stack>

      {bookings.length === 0 && !loading && (
        <Typography color="textSecondary" align="center">
          Нет заявок
        </Typography>
      )}

      {groupedBookings.sortedDates.map((date) => (
        <Box key={date} sx={{ mb: 5 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}
          >
            Заявки на {formatDate(date)}
          </Typography>

          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#fafafa" }}>
                  <TableCell>Код</TableCell>
                  <TableCell>Клиент</TableCell>
                  <TableCell>Маршрут</TableCell>
                  <TableCell>Время</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedBookings.grouped[date].map((booking) => {
                  const badge = getStatusBadge(booking.status);
                  return (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                        >
                          #{booking.id.slice(-4).toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.customer?.first_name || "Без имени"}
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          {booking.customer?.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.desired_trip_location} →{" "}
                        {booking.arrival_location}
                        {booking.is_round_trip && (
                          <Chip
                            label="Туда-обратно"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <b>{booking.desired_departure_time?.slice(0, 5)}</b>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={badge.label}
                          color={badge.color}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            navigate(`/dashboard/bookings/${booking.id}`)
                          }
                        >
                          Детали
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      <CreateBookingModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => dispatch(fetchBookingsList({ skip: 0, limit: 100 }))}
      />
    </Box>
  );
};
