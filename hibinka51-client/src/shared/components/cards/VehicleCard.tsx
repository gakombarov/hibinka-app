import React, { useState } from "react";
import { Box, Typography, Stack, Button, Paper, Chip } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { TripDetailsModal } from "../../../features/trips/TripDetailsModal";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";


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

export const VehicleCard = ({ vehicle, onVehicleDeleted }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: "16px",
          border: "1px solid",
          transition: "0.2s",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">

          <Box sx={{ flexGrow: 1 }}>

            {/* ВЫВОДИМ ИМЯ И ТЕЛЕФОН */}
            <Stack direction="row" spacing={2} color="text.secondary">
              <Typography variant="caption" fontWeight="bold">
                {vehicle?.license_plate} {vehicle?.alias} 👤({vehicle?.capacity} чел.)
              </Typography>
              <Typography variant="caption">{vehicle?.brand}, {vehicle?.model}, {vehicle?.category}</Typography>
            </Stack>
          </Box>

          {/* КНОПКА */}
          <Stack alignItems="flex-end" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => setIsModalOpen(true)}
            >
              <EditIcon/>
            </Button>
          </Stack>

          {/* УДАЛИТЬ АВТО */}
          <Stack alignItems="flex-end" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => onVehicleDeleted(vehicle.id)}
            >
              <DeleteIcon/>
            </Button>
          </Stack>

        </Stack>
      </Paper>

      {/* <TripDetailsModal
        trip={trip}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onTripUpdated}
      /> */}
    </>
  );
};
