import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
        color="inherit"
      >
        Назад к списку
      </Button>

      <Paper
        sx={{
          p: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
        elevation={0}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Детали заявки
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Уникальный идентификатор: {id}
        </Typography>

        <Typography variant="body2">
          В следующем спринте здесь будет полная информация о клиенте, багаже,
          комментариях и кнопки для назначения на рейс!
        </Typography>
      </Paper>
    </Box>
  );
};
