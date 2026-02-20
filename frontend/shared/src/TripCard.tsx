import type { FC, ElementType } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckIcon from "@mui/icons-material/Check";

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
      bgcolor: "#F4C430",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    }}
  >
    <CheckIcon sx={{ color: "#fff", fontSize: 16, fontWeight: "bold" }} />
  </Box>
);

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

  const statusDisplay = isScheduled ? "ПО РАСПИСАНИЮ" : "В ПУТИ";
  const statusStyles = isScheduled
    ? {
        border: "1px solid #F4C430",
        bgcolor: "transparent",
        color: "#1a1a1a",
      }
    : {
        border: "1px solid #E2E8F0",
        bgcolor: "#F4F6F8",
        color: "#1a1a1a",
      };

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        p: 3,
        borderRadius: "32px", // Сильное скругление как в макете
        border: "1px solid #E5E7EB",
        overflow: "hidden", // Чтобы декоративная линия не вылезала за углы
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
        },
      }}
    >
      {/* Декоративная полоса слева (желтый верх, черный низ) */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          background: "linear-gradient(to bottom, #F4C430 50%, #1a1a1a 50%)",
        }}
      />

      <Stack spacing={2.5} sx={{ pl: 1 }}>
        {/* ВЕРХНЯЯ ЧАСТЬ: Время, Маршрут, Статус */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="center"
        >
          {/* Блок времени */}
          <Box sx={{ minWidth: "100px", textAlign: "center", mt: -1 }}>
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
                letterSpacing: "1px",
                textTransform: "uppercase",
                mt: 0.5,
                display: "block",
              }}
            >
              Отправление
            </Typography>
          </Box>

          {/* Центральный блок: Тип, Цена и Stepper */}
          <Box sx={{ flexGrow: 1, width: "100%" }}>
            {/* Плашка маршрута и цена */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2, ml: 2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#1a1a1a",
                  color: "#fff",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "8px",
                }}
              >
                <RouteIcon sx={{ color: "#F4C430", fontSize: 16 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                >
                  {routeType}
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{ fontWeight: 800, color: "#1a1a1a" }}
              >
                {price === 0 ? "Бесплатно" : `${price} ₽`}
              </Typography>
            </Stack>

            {/* Таймлайн (Stepper) */}
            <Stepper
              alternativeLabel
              activeStep={-1}
              connector={<CustomConnector />}
            >
              {stops.map((stop, index) => (
                <Step key={index}>
                  <StepLabel StepIconComponent={CustomStepIcon}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        display: "block",
                        mt: -0.5,
                      }}
                    >
                      {stop.location}
                    </Typography>
                    {stop.time && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#8c98a4", fontWeight: 600 }}
                      >
                        {stop.time}
                      </Typography>
                    )}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Вертикальный разделитель */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              height: "50px",
              borderRight: "1px dashed #D1D5DB",
            }}
          />

          {/* Статус */}
          <Box sx={{ minWidth: "160px", textAlign: "center" }}>
            <Box
              sx={{
                ...statusStyles,
                px: 3,
                py: 1,
                borderRadius: "24px",
                fontWeight: 700,
                fontSize: "0.85rem",
                display: "inline-block",
                textTransform: "uppercase",
              }}
            >
              {statusDisplay}
            </Box>
          </Box>
        </Stack>

        {/* НИЖНЯЯ ЧАСТЬ: Заметки (Опционально) */}
        {notes && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "#F9FAFB",
              border: "1px solid #F3F4F6",
              p: 2,
              borderRadius: "20px",
            }}
          >
            <InfoOutlinedIcon sx={{ color: "#1a1a1a", fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{ color: "#4B5563", fontWeight: 500 }}
            >
              {notes}
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
};
