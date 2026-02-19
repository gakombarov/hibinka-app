import type { FC } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  Divider,
  Grid,
  Button,
} from "@mui/material";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotesIcon from "@mui/icons-material/Notes";

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

const getStatusProps = (
  status: TripStatus,
): {
  label: string;
  color: "info" | "warning" | "success" | "error" | "default";
} => {
  switch (status) {
    case "PLANNED":
      return { label: "Запланирован", color: "info" };
    case "IN_PROGRESS":
      return { label: "В пути", color: "warning" };
    case "COMPLETED":
      return { label: "Завершен", color: "success" };
    case "CANCELLED":
      return { label: "Отменен", color: "error" };
    default:
      return { label: "Неизвестно", color: "default" };
  }
};

const getPaymentProps = (
  status: PaymentStatus,
): { label: string; color: "warning" | "success" | "default" } => {
  switch (status) {
    case "PENDING":
      return { label: "Ожидает оплаты", color: "warning" };
    case "PAID":
      return { label: "Оплачено", color: "success" };
    default:
      return { label: "Неизвестно", color: "default" };
  }
};

export const AdminTripCard: FC<AdminTripCardProps> = ({
  id,
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
  const tripStatusProps = getStatusProps(status);
  const payStatusProps = getPaymentProps(paymentStatus);

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderLeft: "4px solid",
        borderLeftColor: `${tripStatusProps.color}.main`,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
      }}
    >
      {/* Шапка: Дата, Время, Статусы и Тип рейса */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarMonthOutlinedIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" fontWeight="bold">
              {tripDate} • {departureTime}
            </Typography>
          </Box>
          {isRegular && (
            <Chip
              label="Регулярный"
              size="small"
              variant="outlined"
              color="primary"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip
            label={payStatusProps.label}
            color={payStatusProps.color}
            size="small"
            variant="outlined"
          />
          <Chip
            label={tripStatusProps.label}
            color={tripStatusProps.color}
            size="small"
          />
        </Stack>
      </Stack>

      {/* Маршрут */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <Typography variant="h6" fontSize="1.1rem" fontWeight="600">
          {departureLocation}
        </Typography>
        <ArrowForwardIcon color="action" fontSize="small" />
        <Typography variant="h6" fontSize="1.1rem" fontWeight="600">
          {arrivalLocation}
        </Typography>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Операционная информация (Водитель, Машина, Клиент, Деньги) */}
      <Grid container spacing={2} mb={notes ? 2 : 0}>
        <Grid item xs={12} sm={6} md={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonOutlineIcon color="action" fontSize="small" />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                lineHeight={1}
              >
                Водитель
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {driverName}
              </Typography>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DirectionsCarOutlinedIcon color="action" fontSize="small" />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                lineHeight={1}
              >
                Транспорт
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {vehicleName}
              </Typography>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonOutlineIcon color="action" fontSize="small" />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                lineHeight={1}
              >
                Заказчик/Клиент
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {customerName}
              </Typography>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountBalanceWalletOutlinedIcon color="action" fontSize="small" />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                lineHeight={1}
              >
                Сумма (План / Факт)
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {plannedAmount} ₽ /{" "}
                {actualAmount !== null ? `${actualAmount} ₽` : "—"}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Заметки и Кнопка управления */}
      {(notes || id) && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
          mt={notes ? 0 : 2}
        >
          <Box flexGrow={1} mr={2}>
            {notes && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                bgcolor="grey.50"
                p={1}
                borderRadius={1}
              >
                <NotesIcon color="action" fontSize="small" sx={{ mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">
                  {notes}
                </Typography>
              </Stack>
            )}
          </Box>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            disableElevation
          >
            Управление
          </Button>
        </Stack>
      )}
    </Card>
  );
};
