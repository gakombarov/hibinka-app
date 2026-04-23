import React, { useState, useRef } from "react";
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
import { Helmet } from "react-helmet-async";

import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import vkLogo from "../assets/vk-logo.png";
import tgLogo from "../assets/tg-logo.png";
import maxLogo from "../assets/max-logo.png";

import { Button as CustomButton } from "@shared/components/ui/Button";
import { Button } from "@mui/material";
import { Modal } from "@shared/components/ui/Modal";
import { ServiceCard } from "@shared/components/cards/ServiceCard";
import { BookingForm } from "@shared/components/ui/BookingForm";
import { services as servicesData } from "@shared/services";
import { submitPublicBooking } from "../api/bookings";

const CONTACTS = {
  vk: "https://vk.com/club237004378",
  inna: {
    phone: "+79533047844",
    phoneDisplay: "+7 (953) 304-78-44",
    tg: "https://t.me/inkom1974",
    max: "https://max.ru/u/f9LHodD0cOK8_Ydonm0tV1K7ILmI2nN2gbwkx7NWSmWD_tYfXx0ju2VB3vA",
  },
  sasha: {
    phone: "+79211534636",
    phoneDisplay: "+7 (921) 153-46-36",
    tg: "https://t.me/aldr1970",
    max: "https://max.ru/u/f9LHodD0cOJfhXSID9we4MuPTIZIjblkW1HTTVv8D5R9zS0_sleJza9hGNo",
  },
};

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

  const scrollToSchedule = () =>
    scheduleRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleBookingSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await submitPublicBooking(data);
      setSnackbar({
        open: true,
        message: "Заявка успешно отправлена!",
        severity: "success",
      });
      setIsBookingModalOpen(false);
    } catch (error) {
      console.error("Ошибка при отправке заявки:", error);
      setSnackbar({
        open: true,
        message: "Произошла ошибка при отправке. Пожалуйста, позвоните нам.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const messengerButtonStyle = {
    borderRadius: "12px",
    py: 1,
    px: 2,
    color: "text.primary",
    borderColor: "divider",
    textTransform: "none",
    fontSize: "1rem",
    justifyContent: "flex-start",
    "&:hover": {
      borderColor: "primary.main",
      bgcolor: alpha(theme.palette.primary.main, 0.05),
    },
  };

  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
    >
      {/* --- SEO БЛОК ДЛЯ РОБОТОВ --- */}
      <Helmet>
        <title>HIBINKA51 | Трансфер Мурманск — Кировск и область</title>
        <meta
          name="description"
          content="Надежный трансфер по Мурманской области. Доставка сотрудников и горнолыжников в Кировск, Териберку, Апатиты."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TaxiService",
            name: "HIBINKA51",
            provider: {
              "@type": "LocalBusiness",
              name: "HIBINKA51",
              telephone: [CONTACTS.inna.phone, CONTACTS.sasha.phone],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Мурманск",
                addressRegion: "Мурманская область",
              },
            },
            areaServed: ["Кировск", "Мурманск", "Апатиты", "Териберка"],
          })}
        </script>
      </Helmet>

      {/* HERO СЕКЦИЯ */}
      <Box
        component="section"
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
                Надежный трансфер <br /> по{" "}
                <span style={{ color: "#F4C430" }}>Мурманской области</span>
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
                <CustomButton
                  size="large"
                  onClick={scrollToSchedule}
                  sx={{ py: 1.5, px: 4, fontSize: "1.1rem", color: "#1a1a1a" }}
                >
                  Посмотреть расписание
                </CustomButton>
                <CustomButton
                  size="large"
                  variant="outlined"
                  onClick={() => setIsBookingModalOpen(true)}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.3)",
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    "&:hover": { borderColor: "white" },
                  }}
                >
                  Заказать трансфер
                </CustomButton>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <Container maxWidth={false} sx={{ flexGrow: 1, mb: 8 }}>
        <Stack spacing={{ xs: 8, md: 10 }}>
          {/* СЕКЦИЯ: Услуги */}
          <Box component="section">
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
                Здесь появятся актуальные рейсы.
              </Typography>
            </Card>
          </Box>

          {/* СЕКЦИЯ: Контакты и Форма заявки */}
          <Box component="section">
            <Grid container spacing={4} alignItems="flex-start">
              {/* ЛЕВАЯ ЧАСТЬ: Контакты-кнопки*/}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography
                  variant="h3"
                  component="h2"
                  fontWeight="900"
                  color="text.primary"
                  sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}
                >
                  Свяжитесь с нами
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, fontSize: "1.1rem" }}
                >
                  Оставьте заявку онлайн или напишите нам напрямую.
                </Typography>

                <Stack spacing={4}>
                  {/* Общая группа ВК */}
                  <Box>
                    <Typography
                      variant="overline"
                      fontWeight="700"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      Наши соцсети
                    </Typography>
                    <Button
                      variant="outlined"
                      component="a"
                      href={CONTACTS.vk}
                      target="_blank"
                      startIcon={
                        <img
                          src={vkLogo}
                          alt="ВКонтакте"
                          style={{
                            width: 28,
                            height: 28,
                            objectFit: "contain",
                          }}
                        />
                      }
                      sx={{ ...messengerButtonStyle, width: "fit-content" }}
                    >
                      Группа ВКонтакте
                    </Button>
                  </Box>

                  {/* Блок: ИННА */}
                  <Box>
                    <Typography
                      variant="overline"
                      fontWeight="700"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    ></Typography>
                    <Typography
                      variant="h5"
                      fontWeight="900"
                      sx={{ mb: 0.5, color: "text.primary" }}
                    >
                      Инна
                    </Typography>
                    <Typography
                      variant="h4"
                      component="a"
                      href={`tel:${CONTACTS.inna.phone}`}
                      fontWeight="900"
                      color="primary.main"
                      sx={{
                        textDecoration: "none",
                        display: "block",
                        mb: 2,
                        "&:hover": { opacity: 0.8 },
                      }}
                    >
                      {CONTACTS.inna.phoneDisplay}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={2}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Button
                        variant="outlined"
                        component="a"
                        href={CONTACTS.inna.tg}
                        target="_blank"
                        startIcon={
                          <img
                            src={tgLogo}
                            alt="Telegram"
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: "contain",
                            }}
                          />
                        }
                        sx={messengerButtonStyle}
                      >
                        Telegram
                      </Button>
                      <Button
                        variant="outlined"
                        component="a"
                        href={CONTACTS.inna.max}
                        target="_blank"
                        startIcon={
                          <img
                            src={maxLogo}
                            alt="Max"
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: "contain",
                            }}
                          />
                        }
                        sx={messengerButtonStyle}
                      >
                        Написать в Max
                      </Button>
                    </Stack>
                  </Box>

                  {/* Блок: САША */}
                  <Box>
                    <Typography
                      variant="overline"
                      fontWeight="700"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    ></Typography>
                    <Typography
                      variant="h5"
                      fontWeight="900"
                      sx={{ mb: 0.5, color: "text.primary" }}
                    >
                      Александр
                    </Typography>
                    <Typography
                      variant="h4"
                      component="a"
                      href={`tel:${CONTACTS.sasha.phone}`}
                      fontWeight="900"
                      color="primary.main"
                      sx={{
                        textDecoration: "none",
                        display: "block",
                        mb: 2,
                        "&:hover": { opacity: 0.8 },
                      }}
                    >
                      {CONTACTS.sasha.phoneDisplay}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={2}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Button
                        variant="outlined"
                        component="a"
                        href={CONTACTS.sasha.tg}
                        target="_blank"
                        startIcon={
                          <img
                            src={tgLogo}
                            alt="Telegram"
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: "contain",
                            }}
                          />
                        }
                        sx={messengerButtonStyle}
                      >
                        Telegram
                      </Button>
                      <Button
                        variant="outlined"
                        component="a"
                        href={CONTACTS.sasha.max}
                        target="_blank"
                        startIcon={
                          <img
                            src={maxLogo}
                            alt="Max"
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: "contain",
                            }}
                          />
                        }
                        sx={messengerButtonStyle}
                      >
                        Написать в Max
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              {/* ПРАВАЯ ЧАСТЬ: Форма*/}
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

      {/* Модалки и Уведомления */}
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
