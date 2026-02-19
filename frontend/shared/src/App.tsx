import { Button } from "./Button";
import { ServiceCard } from "./ServiceCard";
import { TripCard } from "./TripCard";
import { AdminTripCard } from "./AdminTripCard"; // <--- Импортируем новую карточку
import { Stack, Typography, Box, Container, Grid } from "@mui/material";
import { services } from "./services";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";

function App() {
  return (
    <Box
      className="shared-playground"
      sx={{ minHeight: "100vh", pb: 8, bgcolor: "background.default" }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={6}>
          {/* --- Секция 1: Тест Кнопок --- */}
          <Box sx={{ width: "100%", textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Общие компоненты Hibinka51
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Песочница для тестирования UI компонентов
            </Typography>

            <Box sx={{ p: 3, border: "1px dashed #ccc", borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Тест кнопок (из Button.tsx)
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Button variant="contained" color="primary">
                  Основная
                </Button>
                <Button variant="contained" color="secondary">
                  Вторичная
                </Button>
                <Button variant="outlined">Контурная</Button>
                <Button isLoading>Загрузка</Button>
                <Button rounded>Скругленная</Button>
              </Stack>
            </Box>
          </Box>

          {/* --- Секция 2: Админские карточки (Дашборд) --- */}
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: "bold",
                borderBottom: "2px solid #F4C430",
                pb: 1,
                display: "inline-block",
              }}
            >
              Журнал рейсов (AdminTripCard.tsx)
            </Typography>
            <Stack spacing={2}>
              {/* Тестовая карточка 1: В пути */}
              <AdminTripCard
                id="123e4567-e89b-12d3-a456-426614174000"
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
                vehicleName="Мерседес Спринтер (А123АА)"
                customerName="ООО 'Норникель'"
                notes="Пассажиры с тяжелым багажом, нужна помощь при погрузке."
              />

              {/* Тестовая карточка 2: Запланирован */}
              <AdminTripCard
                id="987fcdeb-51a2-43d7-9012-3456789abcde"
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
                customerName="Частное лицо (Игорь)"
              />
            </Stack>
          </Box>

          {/* --- Секция 3: Публичные карточки (Лэндинг) --- */}
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: "bold",
                borderBottom: "2px solid #F4C430",
                pb: 1,
                display: "inline-block",
              }}
            >
              Расписание рейсов (TripCard.tsx)
            </Typography>
            <Stack spacing={2}>
              <TripCard
                departureTime="07:00"
                price={0}
                routeType="Медицинский трансфер"
                RouteIcon={FavoriteBorderIcon}
                status="ON THE WAY"
                notes="Посадка осуществляется только при наличии направления от лечащего врача."
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
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
