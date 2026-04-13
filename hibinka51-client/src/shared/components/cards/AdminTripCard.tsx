import React from "react";
import { Box, Typography, Stack, Button, Paper, Chip } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";

const getTripStatusColor = (status: string) => {
  switch (status) {
    case "Завершен":
      return "success";
    case "В пути":
      return "warning";
    case "Отменен":
      return "error";
    default:
      return "primary";
  }
};

export const AdminTripCard = ({ trip, onAssign }: any) => {
  const booking = trip.booking || {};
  const debt =
    (Number(booking.total_amount) || 0) - (Number(booking.paid_amount) || 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: trip.has_trailer ? "primary.main" : "divider",
        transition: "0.2s",
        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {/* ВРЕМЯ И ПРИЦЕП */}
        <Box sx={{ minWidth: 80, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="900" color="primary">
            {trip.departure_time?.slice(0, 5)}
          </Typography>

          {/* ОТОБРАЖЕНИЕ ПРИЦЕПА */}
          {trip.has_trailer && (
            <Chip
              icon={<LocalShippingIcon style={{ fontSize: 14 }} />}
              label="ПРИЦЕП"
              size="small"
              color="primary"
              sx={{ mt: 0.5, fontWeight: "bold", fontSize: "10px" }}
            />
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Typography variant="subtitle1" fontWeight="bold">
              {trip.departure_location} → {trip.arrival_location}
            </Typography>

            {/* ЦВЕТНОЙ СТАТУС */}
            <Chip
              label={trip.display_status}
              color={getTripStatusColor(trip.display_status)}
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </Stack>

          <Stack direction="row" spacing={2} color="text.secondary">
            <Typography variant="caption">
              👤 {trip.customer?.first_name || "Клиент"} ({trip.passenger_count}{" "}
              чел.)
            </Typography>
            <Typography variant="caption">
              📞 {trip.customer?.phone || "Нет телефона"}
            </Typography>
          </Stack>
        </Box>

        {/* ДОЛГ И КНОПКА */}
        <Stack alignItems="flex-end" spacing={1}>
          {debt > 0 ? (
            <Chip
              label={`Долг: ${debt} ₽`}
              size="small"
              color="error"
              variant="outlined"
            />
          ) : (
            <Chip
              label="Оплачено"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          <Button
            variant="contained"
            size="small"
            onClick={() => onAssign(trip)}
          >
            Назначить авто
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
