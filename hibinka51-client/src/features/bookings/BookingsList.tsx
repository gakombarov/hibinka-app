import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { fetchAdminBookings, updateBooking } from "../.././api/bookings";
import { Booking } from "@shared/types/api";

const getStatusChip = (status: string) => {
  switch (status) {
    case "NEW":
      return <Chip label="Новая" color="info" size="small" />;
    case "CONFIRMED":
      return <Chip label="Подтверждена" color="success" size="small" />;
    case "CANCELLED":
      return <Chip label="Отменена" color="error" size="small" />;
    default:
      return <Chip label={status} size="small" />;
  }
};

export const BookingsList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAdminBookings();
        setBookings(data);
        setError(null);
      } catch (err) {
        setError("Не удалось загрузить список заявок");
      } finally {
        setIsLoading(false);
      }
    };
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const nameMatch = booking.customer?.first_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const phoneMatch = booking.customer?.phone?.includes(searchQuery);
    return nameMatch || phoneMatch;
  });

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus as any } : b)),
      );

      await updateBooking(id, { status: newStatus as any });
    } catch (err) {
      setError("Не удалось обновить статус");
      const data = await fetchAdminBookings();
      setBookings(data);
    }
  };

  const statusStyles: Record<
    string,
    { color: string; bgColor: string; label: string }
  > = {
    NEW: {
      label: "Новая",
      color: "#0288d1",
      bgColor: "#e1f5fe",
    },
    CONFIRMED: {
      label: "Подтверждена",
      color: "#2e7d32",
      bgColor: "#e8f5e9",
    },
    IN_PROGRESS: {
      label: "В работе",
      color: "#ed6c02",
      bgColor: "#fff3e0",
    },
    COMPLETED: {
      label: "Завершена",
      color: "#757575",
      bgColor: "#f5f5f5",
    },
    CANCELLED: {
      label: "Отменена",
      color: "#d32f2f",
      bgColor: "#ffebee",
    },
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Входящие заявки
        </Typography>

        {/* ПОЛЕ ПОИСКА */}
        <TextField
          size="small"
          placeholder="Поиск по имени или телефону..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300, bgcolor: "background.paper" }}
        />
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell>
                <strong>Дата и Время</strong>
              </TableCell>
              <TableCell>
                <strong>Маршрут</strong>
              </TableCell>
              <TableCell>
                <strong>Клиент</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Пассажиров</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Статус</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Действия</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  Ничего не найдено
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    {booking.desired_trip_date} <br />
                    <Typography variant="caption" color="text.secondary">
                      {booking.desired_departure_time.substring(0, 5)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {booking.desired_trip_location} — {booking.arrival_location}
                  </TableCell>
                  <TableCell>
                    {booking.customer?.first_name || "Клиент"} <br />
                    <Typography variant="caption" color="text.secondary">
                      {booking.customer?.phone || "Телефон скрыт"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {booking.passenger_count}
                  </TableCell>
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={booking.status}
                        onChange={(e) =>
                          handleStatusChange(booking.id, e.target.value)
                        }
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: "bold",
                          height: 32,
                          color: statusStyles[booking.status]?.color,
                          bgcolor: statusStyles[booking.status]?.bgColor,
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                      >
                        {Object.entries(statusStyles).map(([key, style]) => (
                          <MenuItem
                            key={key}
                            value={key}
                            sx={{
                              fontSize: "0.8125rem",
                              color: style.color,
                              "&.Mui-selected": { bgcolor: style.bgColor },
                              "&:hover": { bgcolor: style.bgColor },
                            }}
                          >
                            {style.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    {/* КНОПКА ОТКРЫТЬ*/}
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() =>
                        navigate(`/dashboard/bookings/${booking.id}`)
                      }
                    >
                      Открыть
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
