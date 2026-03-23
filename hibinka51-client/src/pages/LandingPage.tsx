import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Card,
  alpha,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";

import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";

import { Button } from "@shared/components/ui/Button";
import { Modal } from "@shared/components/ui/Modal";
import { ServiceCard } from "@shared/components/cards/ServiceCard";
import { BookingForm } from "@shared/components/ui/BookingForm";
import { services as servicesData } from "@shared/services";
import { submitPublicBooking } from "../api/bookings";

export const LandingPage = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // SEO: Динамический тайтл страницы
  useEffect(() => {
    document.title = "HIBINKA51 | Пассажирские перевозки и трансфер Мурманск";
  }, []);

  const scrollToSchedule = () =>
    scheduleRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleBookingSubmit = async (data: any) => {
    // Замени any на BookingFormData, если импортируешь тип
    setIsLoading(true);
    try {
      await submitPublicBooking(data);
      setSnackbar({
        open: true,
        message:
          "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.",
        severity: "success",
      });
      setIsBookingModalOpen(false);
    } catch (error) {
      console.error("Ошибка при отправке заявки:", error);
      setSnackbar({
        open: true,
        message:
          "Произошла ошибка при отправке. Пожалуйста, позвоните нам по телефону.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
    >
      {/* HERO СЕКЦИЯ: превращаем в <section> */}
      <Box
        component="section"
        aria-label="Главный экран"
        sx={{
          bgcolor: "#111418",
          backgroundImage:
            'linear-gradient(rgba(32, 51, 74, 0.75), rgba(17, 20, 24, 0.95)), url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          pt: { xs: 8, md: 14 },
          pb: { xs: 8, md: 14 },
          position: "relative",
          borderBottomRightRadius: { xs: "32px", md: "80px" },
          borderBottomLeftRadius: { xs: "32px", md: "80px" },
          mb: { xs: 6, md: 8 },
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  display: "inline-block",
                  bgcolor: "rgba(244, 196, 48, 0.1)",
                  color: "#F4C430",
                  px: 2,
                  py: 0.5,
                  borderRadius: "20px",
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Пассажирские перевозки
              </Box>
              <Typography
                variant="h1"
                component="h1"
                fontWeight="900"
                sx={{
                  mb: 3,
                  fontSize: { xs: "2.2rem", sm: "3rem", md: "4rem" },
                  lineHeight: 1.1,
                }}
              >
                Надежный трансфер <br />
                по <span style={{ color: "#F4C430" }}>Мурманской области</span>
              </Typography>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  color: "#9CA3AF",
                  mb: 5,
                  maxWidth: "600px",
                  fontWeight: 400,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                }}
              >
                Регулярные рейсы, вахтовые перевозки и индивидуальные трансферы.
                Комфорт и безопасность в любых погодных условиях.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  size="large"
                  onClick={scrollToSchedule}
                  sx={{ py: 1.5, px: 4, fontSize: "1.1rem", color: "#1a1a1a" }}
                >
                  Посмотреть расписание
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.3)",
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    "&:hover": { borderColor: "white" },
                  }}
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Заказать трансфер
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <Container maxWidth={false} sx={{ flexGrow: 1, mb: 8 }}>
        <Stack spacing={{ xs: 8, md: 10 }}>
          {/* СЕКЦИЯ: Услуги */}
          <Box component="section" aria-label="Наши услуги">
            <Typography
              variant="h4"
              component="h2"
              fontWeight="900"
              color="text.primary"
              sx={{ mb: 1, fontSize: { xs: "1.8rem", md: "2.125rem" } }}
            >
              Наши услуги
            </Typography>
            <Typography
              variant="body1"
              component="p"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Решения для бизнеса и частных лиц
            </Typography>
            <Grid container spacing={3} alignItems="flex-start">
              {servicesData.map((s, i) => (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i} display="flex">
                  <ServiceCard {...s} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* СЕКЦИЯ: Расписание */}
          <Box
            component="section"
            aria-label="Расписание"
            ref={scheduleRef}
            sx={{ scrollMarginTop: "100px" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                mb: 4,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h2"
                  fontWeight="900"
                  color="text.primary"
                  sx={{ mb: 1, fontSize: { xs: "1.8rem", md: "2.125rem" } }}
                >
                  Ближайшие рейсы
                </Typography>
                <Typography
                  variant="body1"
                  component="p"
                  color="text.secondary"
                >
                  Постоянные и регулярные маршруты
                </Typography>
              </Box>
            </Box>
            <Card
              elevation={0}
              sx={{
                p: { xs: 4, md: 8 },
                borderRadius: "32px",
                border: "2px dashed",
                borderColor: "divider",
                textAlign: "center",
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                backgroundImage: "none",
              }}
            >
              <DirectionsBusIcon
                sx={{
                  fontSize: 56,
                  color: "text.secondary",
                  mb: 2,
                  opacity: 0.3,
                }}
                aria-hidden="true"
              />
              <Typography
                variant="h5"
                component="h3"
                fontWeight="800"
                color="text.primary"
                gutterBottom
              >
                Расписание загружается...
              </Typography>
              <Typography
                variant="body1"
                component="p"
                color="text.secondary"
                sx={{ maxWidth: "400px", mx: "auto" }}
              >
                Здесь появятся актуальные рейсы из базы данных.
              </Typography>
            </Card>
          </Box>

          {/* СЕКЦИЯ: Форма заявки */}
          <Box component="section" aria-label="Форма заказа">
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography
                  variant="h3"
                  component="h2"
                  fontWeight="900"
                  color="text.primary"
                  sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}
                >
                  Готовы к поездке?
                </Typography>
                <Typography
                  variant="body1"
                  component="p"
                  color="text.secondary"
                  sx={{ mb: 4, fontSize: "1.1rem" }}
                >
                  Оставьте заявку онлайн. Наш диспетчер рассчитает стоимость и
                  свяжется с вами для подтверждения.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Box
                    sx={{
                      bgcolor: "primary.main",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PhoneOutlinedIcon
                      sx={{ color: "#1a1a1a" }}
                      aria-hidden="true"
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      component="p"
                      color="text.secondary"
                      fontWeight="700"
                    >
                      Или позвоните нам
                    </Typography>
                    <Typography
                      variant="h6"
                      component="p"
                      fontWeight="900"
                      color="text.primary"
                    >
                      +7 (953) 304-78-44 Инна
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card
                  sx={{
                    p: { xs: 2, md: 5 },
                    borderRadius: "32px",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 20px 40px rgba(0,0,0,0.3)"
                        : "0 20px 40px rgba(0,0,0,0.03)",
                    bgcolor: "background.paper",
                    backgroundImage: "none",
                  }}
                  elevation={0}
                >
                  <BookingForm
                    onSubmit={handleBookingSubmit}
                    isLoading={isLoading}
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Container>

      {/* Модальное окно и Snackbar остаются как были */}
      <Modal
        open={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Заказ трансфера"
      >
        <BookingForm onSubmit={handleBookingSubmit} isLoading={isLoading} />
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: "12px" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
