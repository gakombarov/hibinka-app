import React, { useState } from "react";
import { Box, Typography, Stack, Button, Paper, Chip } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { TripDetailsModal } from "../../../features/trips/TripDetailsModal";

const getTripStatusColor = (status: string) => {
  switch (status) {
    case "Завершен":
    case "COMPLETED":
      return "success";
    case "В пути":
    case "IN_PROGRESS":
      return "warning";
    case "Отменен":
    case "CANCELLED":
      return "error";
    default:
      return "primary";
  }
};

export const AdminTripCard = ({ trip, onTripUpdated }: any) => {
  const booking = trip.booking || {};
  const debt =
    (Number(booking.total_amount) || 0) - (Number(booking.paid_amount) || 0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const clientName =
    trip.customer?.first_name ||
    booking.customer?.first_name ||
    "Имя не указано";
  const clientPhone =
    trip.customer?.phone || booking.customer?.phone || "Телефон не указан";

  return (
    <>
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

              <Chip
                label={trip.display_status || trip.status}
                color={getTripStatusColor(trip.display_status || trip.status)}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Stack>

            {/* ВЫВОДИМ ИМЯ И ТЕЛЕФОН */}
            <Stack direction="row" spacing={2} color="text.secondary">
              <Typography variant="caption" fontWeight="bold">
                👤 {clientName} ({trip.passenger_count} чел.)
              </Typography>
              <Typography variant="caption">📞 {clientPhone}</Typography>
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
              onClick={() => setIsModalOpen(true)}
            >
              Детали / Авто
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <TripDetailsModal
        trip={trip}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onTripUpdated}
      />
    </>
  );
};
