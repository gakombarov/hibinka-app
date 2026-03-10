import React from "react";
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
  useTheme,
  styled,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckIcon from "@mui/icons-material/Check";

const CustomConnector = styled(StepConnector)(({ theme }: any) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 12,
    left: "calc(-50% + 12px)",
    right: "calc(50% + 12px)",
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.divider,
    borderTopWidth: 2,
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
    <CheckIcon sx={{ color: "#1a1a1a", fontSize: 16, fontWeight: "bold" }} />
  </Box>
);

export const TripCard = ({
  departureTime,
  price,
  routeType,
  RouteIcon,
  status,
  notes,
  stops,
}: any) => {
  const isScheduled = status === "SCHEDULED";
  const statusDisplay = isScheduled ? "ПО РАСПИСАНИЮ" : "В ПУТИ";
  const theme = useTheme();

  const statusStyles = isScheduled
    ? {
        border: "1px solid #F4C430",
        bgcolor: "transparent",
        color: theme.palette.text.primary,
      }
    : {
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.mode === "dark" ? "#1E293B" : "#F4F6F8",
        color: theme.palette.text.primary,
      };

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        p: 3,
        borderRadius: "32px",
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 4px 20px rgba(0,0,0,0.2)"
            : "0 4px 20px rgba(0,0,0,0.03)",
        "&:hover": {
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 6px 24px rgba(0,0,0,0.4)"
              : "0 6px 24px rgba(0,0,0,0.06)",
        },
      }}
    >
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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="center"
        >
          <Box sx={{ minWidth: "100px", textAlign: "center", mt: -1 }}>
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
                letterSpacing: "1px",
                textTransform: "uppercase",
                mt: 0.5,
                display: "block",
              }}
            >
              Отправление
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, width: "100%" }}>
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
                sx={{ fontWeight: 800, color: "text.primary" }}
              >
                {price === 0 ? "Бесплатно" : `${price} ₽`}
              </Typography>
            </Stack>
            <Stepper
              alternativeLabel
              activeStep={-1}
              connector={<CustomConnector />}
            >
              {stops.map((stop: any, index: number) => (
                <Step key={index}>
                  <StepLabel StepIconComponent={CustomStepIcon}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        display: "block",
                        mt: -0.5,
                      }}
                    >
                      {stop.location}
                    </Typography>
                    {stop.time && (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontWeight: 600 }}
                      >
                        {stop.time}
                      </Typography>
                    )}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              height: "50px",
              borderRight: `1px dashed ${theme.palette.divider}`,
            }}
          />
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
        {notes && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: theme.palette.mode === "dark" ? "#08090C" : "#F9FAFB",
              border: `1px solid ${theme.palette.divider}`,
              p: 2,
              borderRadius: "20px",
            }}
          >
            <InfoOutlinedIcon sx={{ color: "text.primary", fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {notes}
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
};
