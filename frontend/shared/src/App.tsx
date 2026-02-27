import React, { useState, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  Box,
  Container,
  Stack,
  Typography,
  Grid,
  Card,
  InputAdornment,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { getDesignTokens } from "./theme";
import { Button } from "./Button";
import { InputField } from "./InputField";
import { ServiceCard } from "./ServiceCard";
import { services as servicesData } from "./services";
import { TripCard } from "./TripCard";
import { AdminTripCard } from "./AdminTripCard";
import { Modal } from "./Modal";

export default function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("light");

  const toggleTheme = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          pb: 8,
          pt: 4,
          transition: "background-color 0.3s ease",
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={8}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="900"
                  color="text.primary"
                  gutterBottom
                >
                  Hibinka51 <span style={{ color: "#F4C430" }}>UI Kit</span>
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  fontWeight="400"
                >
                  Единый файл песочницы для предпросмотра
                </Typography>
              </Box>

              <Tooltip
                title={`Включить ${mode === "dark" ? "светлую" : "темную"} тему`}
              >
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    color: "text.secondary",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                  }}
                >
                  {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight="800"
                color="text.primary"
                sx={{ mb: 3 }}
              >
                1. Базовые элементы
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{ p: 4, borderRadius: "24px", height: "100%" }}
                    elevation={0}
                    variant="outlined"
                  >
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      color="text.primary"
                      mb={3}
                    >
                      Кнопки
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Button variant="contained">Основная</Button>
                      <Button variant="contained" color="secondary">
                        Тёмная
                      </Button>
                      <Button variant="outlined">Контурная</Button>
                      <Button isLoading>Загрузка</Button>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{ p: 4, borderRadius: "24px" }}
                    elevation={0}
                    variant="outlined"
                  >
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      color="text.primary"
                      mb={3}
                    >
                      Поля ввода
                    </Typography>
                    <Stack spacing={2}>
                      <InputField label="Ваше имя" placeholder="Иван Иванов" />
                      <InputField
                        label="Телефон"
                        placeholder="+7 (999) 000-00-00"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneOutlinedIcon
                                sx={{ color: "text.secondary" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <InputField
                        label="Откуда"
                        defaultValue="Мурм"
                        error
                        helperText="Город не найден. Выберите из списка."
                      />
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight="800"
                color="text.primary"
                sx={{ mb: 3 }}
              >
                2. Лэндинг (Публичная часть)
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="flex-start">
                  {servicesData.map((s, i) => (
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={i}>
                      <ServiceCard {...s} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Stack spacing={2}>
                <TripCard
                  departureTime="07:00"
                  price={0}
                  routeType="Медицинский трансфер"
                  RouteIcon={FavoriteBorderIcon}
                  status="ON THE WAY"
                  notes="Посадка только при наличии направления от врача."
                  stops={[
                    { location: "Мончегорск", time: "07:00" },
                    { location: "Оленегорск", time: "07:45" },
                    { location: "Мурманск", time: "09:30" },
                  ]}
                />
                <TripCard
                  departureTime="08:00"
                  price={850}
                  routeType="Регулярный рейс"
                  RouteIcon={DirectionsBusIcon}
                  status="SCHEDULED"
                  stops={[
                    { location: "Мурманск", time: "08:00" },
                    { location: "Оленегорск" },
                    { location: "Мончегорск" },
                    { location: "Апатиты" },
                  ]}
                />
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight="800"
                color="text.primary"
                sx={{ mb: 3 }}
              >
                3. Дашборд (Журнал)
              </Typography>
              <Stack spacing={2}>
                <AdminTripCard
                  id="1"
                  tripDate="24 Октября 2024"
                  departureTime="07:00"
                  departureLocation="Мончегорск"
                  arrivalLocation="Мурманск"
                  status="IN_PROGRESS"
                  paymentStatus="PAID"
                  plannedAmount={3500}
                  actualAmount={3500}
                  isRegular={false}
                  driverName="Иванов Сергей"
                  vehicleName="Мерседес Спринтер"
                  customerName="ООО 'Норникель'"
                />
                <AdminTripCard
                  id="2"
                  tripDate="25 Октября 2024"
                  departureTime="08:30"
                  departureLocation="Апатиты"
                  arrivalLocation="Кировск"
                  status="PLANNED"
                  paymentStatus="PENDING"
                  plannedAmount={800}
                  actualAmount={null}
                  isRegular={true}
                  driverName="Не назначен"
                  vehicleName="Не назначена"
                  customerName="Игорь (Частное лицо)"
                />
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight="800"
                color="text.primary"
                sx={{ mb: 3 }}
              >
                4. Универсальное Модальное Окно
              </Typography>
              <Card
                sx={{
                  p: 4,
                  borderRadius: "32px",
                  textAlign: "center",
                  bgcolor: mode === "dark" ? "background.paper" : "#1a1a1a",
                  color: "#fff",
                }}
                elevation={0}
              >
                <Typography variant="h4" fontWeight="800" mb={2}>
                  Тест Модального Окна
                </Typography>
                <Typography variant="body1" mb={4} color="#9CA3AF">
                  Нажмите на кнопку, чтобы открыть пустую модалку.
                </Typography>
                <Button
                  size="large"
                  onClick={() => setIsBookingModalOpen(true)}
                  sx={{ py: 1.5, px: 4, fontSize: "1.1rem" }}
                >
                  Открыть модалку
                </Button>
              </Card>

              <Modal
                open={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title="Пустая модалка"
              >
                <Box sx={{ py: 2, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    Это универсальный компонент Modal.
                    <br />
                    <br />
                  </Typography>
                </Box>
              </Modal>
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
