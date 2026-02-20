import type { FC } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

export type TripStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID";

export interface AdminTripCardProps {
  id: string;
  tripDate: string;
  departureTime: string;
  departureLocation: string;
  arrivalLocation: string;
  status: TripStatus;
  paymentStatus: PaymentStatus;
  plannedAmount: number;
  actualAmount: number | null;
  isRegular: boolean;
  notes?: string;
  driverName?: string;
  vehicleName?: string;
  customerName?: string;
}

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 12,
    left: "calc(-50% + 12px)",
    right: "calc(50% + 12px)",
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.divider,
    borderTopWidth: 1,
  },
}));

const CustomStepIcon = () => (
  <Box
    sx={{
      width: 24,
      height: 24,
      borderRadius: "50%",
      bgcolor: "#1a1a1a",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    }}
  >
    <CheckIcon sx={{ color: "#F4C430", fontSize: 16, fontWeight: "bold" }} />
  </Box>
);

const getPaymentStyles = (status: PaymentStatus) => {
  if (status === "PAID") {
    return {
      bg: "#ECFDF5",
      color: "#059669",
      border: "#A7F3D0",
      label: "Оплачено",
    };
  }
  return {
    bg: "#FFFBEB",
    color: "#D97706",
    border: "#FDE68A",
    label: "Ожидает оплаты",
  };
};

const getTripStyles = (status: TripStatus) => {
  switch (status) {
    case "PLANNED":
      return { bg: "#F3F4F6", color: "#4B5563", label: "Запланирован" };
    case "IN_PROGRESS":
      return { bg: "#FEF08A", color: "#854D0E", label: "В пути" };
    case "COMPLETED":
      return { bg: "#ECFDF5", color: "#059669", label: "Завершен" };
    case "CANCELLED":
      return { bg: "#FEF2F2", color: "#DC2626", label: "Отменен" };
    default:
      return { bg: "#F3F4F6", color: "#4B5563", label: "Неизвестно" };
  }
};

export const AdminTripCard: FC<AdminTripCardProps> = ({
  tripDate,
  departureTime,
  departureLocation,
  arrivalLocation,
  status,
  paymentStatus,
  plannedAmount,
  actualAmount,
  isRegular,
  notes,
  driverName = "Не назначен",
  vehicleName = "Не назначена",
  customerName = "Не указан",
}) => {
  const payStyles = getPaymentStyles(paymentStatus);
  const tripStyles = getTripStyles(status);

  return (
    <Card
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        borderRadius: "32px", // То же скругление, что и в TripCard
        border: "1px solid #E5E7EB",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.06)" },
      }}
    >
      <Stack spacing={3}>
        {/* ВЕРХНИЙ БЛОК: Основная информация */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="center"
        >
          {/* Время и дата (Слева) */}
          <Box sx={{ minWidth: "120px", textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}
            >
              {departureTime}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "#8c98a4",
                textTransform: "uppercase",
                mt: 0.5,
                display: "block",
              }}
            >
              {tripDate}
            </Typography>
          </Box>

          {/* Маршрут (По центру) */}
          <Box sx={{ flexGrow: 1, width: "100%", px: { xs: 0, md: 4 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                px: 1,
              }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                {isRegular && (
                  <Box
                    sx={{
                      bgcolor: "#1a1a1a",
                      color: "#F4C430",
                      px: 1,
                      py: 0.5,
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    РЕГУЛЯРНЫЙ
                  </Box>
                )}
              </Box>
              {/* Бейджик статуса поездки */}
              <Box
                sx={{
                  bgcolor: tripStyles.bg,
                  color: tripStyles.color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {tripStyles.label}
              </Box>
            </Box>

            <Stepper
              alternativeLabel
              activeStep={-1}
              connector={<CustomConnector />}
            >
              <Step>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {departureLocation}
                  </Typography>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {arrivalLocation}
                  </Typography>
                </StepLabel>
              </Step>
            </Stepper>
          </Box>

          {/* Вертикальный разделитель */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              height: "60px",
              borderRight: "1px dashed #D1D5DB",
            }}
          />

          {/* Финансы и Управление (Справа) */}
          <Box sx={{ minWidth: "180px", textAlign: "right" }}>
            <Stack spacing={1} alignItems="flex-end">
              {/* Цветовой маркер оплаты */}
              <Box
                sx={{
                  border: `1px solid ${payStyles.border}`,
                  bgcolor: payStyles.bg,
                  color: payStyles.color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {payStyles.label}
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#8c98a4",
                    fontWeight: 600,
                    display: "inline-block",
                    mr: 1,
                  }}
                >
                  План: {plannedAmount} ₽
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#1a1a1a",
                    display: "inline-block",
                  }}
                >
                  Факт: {actualAmount !== null ? actualAmount : 0} ₽
                </Typography>
              </Box>

              <Button
                variant="contained"
                disableElevation
                sx={{
                  bgcolor: "#F4C430",
                  color: "#1a1a1a",
                  fontWeight: 700,
                  borderRadius: "12px",
                  "&:hover": { bgcolor: "#E5B62A" },
                }}
              >
                Управление
              </Button>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ borderStyle: "dashed", borderColor: "#E5E7EB" }} />

        {/* НИЖНИЙ БЛОК: Операционные детали и Заметки */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonOutlineIcon sx={{ color: "#8c98a4", fontSize: 20 }} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#8c98a4", display: "block", lineHeight: 1 }}
                >
                  Водитель
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  {driverName}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <DirectionsCarOutlinedIcon
                sx={{ color: "#8c98a4", fontSize: 20 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#8c98a4", display: "block", lineHeight: 1 }}
                >
                  Транспорт
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  {vehicleName}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <AccountBalanceWalletOutlinedIcon
                sx={{ color: "#8c98a4", fontSize: 20 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#8c98a4", display: "block", lineHeight: 1 }}
                >
                  Заказчик
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  {customerName}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Заметки, если есть */}
          {notes && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "#F9FAFB",
                px: 2,
                py: 1,
                borderRadius: "12px",
                maxWidth: "400px",
              }}
            >
              <InfoOutlinedIcon sx={{ color: "#F4C430", fontSize: 18 }} />
              <Typography
                variant="caption"
                sx={{ color: "#4B5563", fontWeight: 500 }}
              >
                {notes}
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
