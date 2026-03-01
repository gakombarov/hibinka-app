import React from "react";
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
  useTheme,
  styled,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

const CustomConnector = styled(StepConnector)(({ theme }: any) => ({
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

const AdminStepIcon = () => (
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

const getPaymentStyles = (status: string, isDark: boolean) => {
  if (status === "PAID")
    return {
      bg: isDark ? "rgba(5, 150, 105, 0.2)" : "#ECFDF5",
      color: isDark ? "#34D399" : "#059669",
      border: isDark ? "#059669" : "#A7F3D0",
      label: "Оплачено",
    };
  return {
    bg: isDark ? "rgba(217, 119, 6, 0.2)" : "#FFFBEB",
    color: isDark ? "#FBBF24" : "#D97706",
    border: isDark ? "#D97706" : "#FDE68A",
    label: "Ожидает оплаты",
  };
};

const getTripStyles = (status: string, isDark: boolean) => {
  switch (status) {
    case "PLANNED":
      return {
        bg: isDark ? "#1E293B" : "#F3F4F6",
        color: isDark ? "#94A3B8" : "#4B5563",
        label: "Запланирован",
      };
    case "IN_PROGRESS":
      return {
        bg: isDark ? "rgba(253, 230, 138, 0.2)" : "#FEF08A",
        color: isDark ? "#FDE047" : "#854D0E",
        label: "В пути",
      };
    case "COMPLETED":
      return {
        bg: isDark ? "rgba(5, 150, 105, 0.2)" : "#ECFDF5",
        color: isDark ? "#34D399" : "#059669",
        label: "Завершен",
      };
    case "CANCELLED":
      return {
        bg: isDark ? "rgba(220, 38, 38, 0.2)" : "#FEF2F2",
        color: isDark ? "#F87171" : "#DC2626",
        label: "Отменен",
      };
    default:
      return {
        bg: isDark ? "#1E293B" : "#F3F4F6",
        color: isDark ? "#94A3B8" : "#4B5563",
        label: "Неизвестно",
      };
  }
};

export const AdminTripCard = ({
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
}: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const payStyles = getPaymentStyles(paymentStatus, isDark);
  const tripStyles = getTripStyles(status, isDark);

  return (
    <Card
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        borderRadius: "32px",
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        boxShadow: isDark
          ? "0 4px 20px rgba(0,0,0,0.2)"
          : "0 4px 20px rgba(0,0,0,0.02)",
        "&:hover": {
          boxShadow: isDark
            ? "0 6px 24px rgba(0,0,0,0.4)"
            : "0 6px 24px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="center"
        >
          <Box sx={{ minWidth: "120px", textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}
            >
              {departureTime}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                textTransform: "uppercase",
                mt: 0.5,
                display: "block",
              }}
            >
              {tripDate}
            </Typography>
          </Box>
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
                <StepLabel StepIconComponent={AdminStepIcon}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {departureLocation}
                  </Typography>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel StepIconComponent={AdminStepIcon}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {arrivalLocation}
                  </Typography>
                </StepLabel>
              </Step>
            </Stepper>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              height: "60px",
              borderRight: `1px dashed ${theme.palette.divider}`,
            }}
          />
          <Box sx={{ minWidth: "180px", textAlign: "right" }}>
            <Stack spacing={1} alignItems="flex-end">
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
                    color: "text.secondary",
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
                    color: "text.primary",
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
        <Divider
          sx={{ borderStyle: "dashed", borderColor: theme.palette.divider }}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonOutlineIcon
                sx={{ color: "text.secondary", fontSize: 20 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  Водитель
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {driverName}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <DirectionsCarOutlinedIcon
                sx={{ color: "text.secondary", fontSize: 20 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  Транспорт
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {vehicleName}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccountBalanceWalletOutlinedIcon
                sx={{ color: "text.secondary", fontSize: 20 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  Заказчик
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {customerName}
                </Typography>
              </Box>
            </Stack>
          </Stack>
          {notes && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: isDark ? "#08090C" : "#F9FAFB",
                px: 2,
                py: 1,
                borderRadius: "12px",
                maxWidth: "400px",
              }}
            >
              <InfoOutlinedIcon sx={{ color: "#F4C430", fontSize: 18 }} />
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 500 }}
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
