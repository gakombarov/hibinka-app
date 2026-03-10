import React, { useState } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Grid,
  Card,
  InputAdornment,
} from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";

import { Button } from "@shared/components/ui/Button";
import { InputField } from "@shared/components/ui/InputField";
import { ServiceCard } from "@shared/components/cards/ServiceCard";
import { services as servicesData } from "@shared/services";
import { TripCard } from "@shared/components/cards/TripCard";
import { AdminTripCard } from "@shared/components/cards/AdminTripCard";
import { Modal } from "@shared/components/ui/Modal";

export const SandboxPage = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
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
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h3"
              fontWeight="900"
              color="text.primary"
              gutterBottom
            >
              Hibinka51 <span style={{ color: "#F4C430" }}>UI Kit</span>
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="400">
              Изолированная среда для общих компонентов
            </Typography>
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
              <Grid size={{ xs: 12, md: 6 }}>
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
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Button variant="contained">Основная</Button>
                    <Button variant="contained" color="secondary">
                      Тёмная
                    </Button>
                    <Button variant="outlined">Контурная</Button>
                    <Button isLoading>Загрузка</Button>
                  </Stack>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                      helperText="Город не найден."
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
                {servicesData?.map((s, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
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
                notes="Посадка только по направлению."
                stops={[
                  { location: "Мончегорск", time: "07:00" },
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
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="h5"
              fontWeight="800"
              color="text.primary"
              sx={{ mb: 3 }}
            >
              4. Модальное Окно
            </Typography>
            <Card
              sx={{ p: 4, borderRadius: "32px", textAlign: "center" }}
              elevation={0}
              variant="outlined"
            >
              <Typography variant="h4" fontWeight="800" mb={2}>
                Тест Модалки
              </Typography>
              <Button size="large" onClick={() => setIsBookingModalOpen(true)}>
                Открыть
              </Button>
            </Card>

            <Modal
              open={isBookingModalOpen}
              onClose={() => setIsBookingModalOpen(false)}
              title="Пустая модалка"
            >
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  Универсальный компонент Modal.
                </Typography>
              </Box>
            </Modal>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
