import type { FC, ElementType } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export type TripStatus = "SCHEDULED" | "ON THE WAY";

export interface TripStop {
  location: string;
  time?: string;
}

export interface TripCardProps {
  departureTime: string;
  price: number;
  routeType: string;
  RouteIcon: ElementType;
  status: TripStatus;
  notes?: string;
  stops: TripStop[];
}

export const TripCard: FC<TripCardProps> = ({
  departureTime,
  price,
  routeType,
  RouteIcon,
  status,
  notes,
  stops,
}) => {
  const isScheduled = status === "SCHEDULED";
  const statusColor = isScheduled ? "success.main" : "primary.main";
  const statusTextColor = isScheduled ? "#ffffff" : "#1a1a1a";

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "6px solid",
        borderLeftColor: statusColor,
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        "&:hover": {
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        },
      }}
    >
      {/* --- ВЕРХНЯЯ ЧАСТЬ: Время, Маршрут и Статус --- */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems={{ xs: "flex-start", md: "center" }}
          flexGrow={1}
          sx={{ minWidth: 0 }}
        >
          {/* Время отправления */}
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color: "text.primary", minWidth: "90px" }}
          >
            {departureTime}
          </Typography>

          {/* Центральный блок: Тип, Цена и МАРШРУТ */}
          <Box sx={{ flexGrow: 1, width: "100%", overflow: "hidden" }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <RouteIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                {routeType}
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                •
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: price === 0 ? "success.main" : "primary.main",
                  textTransform: price === 0 ? "uppercase" : "none",
                  letterSpacing: price === 0 ? "0.5px" : "normal",
                }}
              >
                {price === 0 ? "Бесплатно" : `${price} ₽`}
              </Typography>
            </Stack>

            {/* Визуализация маршрута */}
            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": { height: "4px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.1)",
                  borderRadius: "4px",
                },
              }}
            >
              <Stepper
                alternativeLabel
                activeStep={-1}
                sx={{ minWidth: `${stops.length * 100}px` }}
              >
                {stops.map((stop, index) => (
                  <Step key={index}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          color: "divider",
                          "&.Mui-active, &.Mui-completed": {
                            color: statusColor,
                          },
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        {stop.location}
                      </Typography>
                      {stop.time && (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {stop.time}
                        </Typography>
                      )}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
        </Stack>

        {/* Статус */}
        <Box sx={{ alignSelf: { xs: "flex-end", md: "center" } }}>
          <Chip
            label={status}
            sx={{
              bgcolor: statusColor,
              color: statusTextColor,
              fontWeight: 700,
              borderRadius: "8px",
              px: 1,
              height: "36px",
            }}
          />
        </Box>
      </Stack>

      {/* --- НИЖНЯЯ ЧАСТЬ: Блок с важной информацией (Заметки) --- */}
      {/* Рендерится только если есть notes */}
      {notes && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor:
              price === 0
                ? "rgba(34, 197, 94, 0.08)"
                : "rgba(244, 196, 48, 0.1)",
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <InfoOutlinedIcon
            sx={{
              color: price === 0 ? "success.main" : "primary.main",
              fontSize: 20,
              mt: 0.2,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: "text.primary",
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {notes}
          </Typography>
        </Box>
      )}
    </Card>
  );
};
