import { Button } from "./Button";
import { ServiceCard } from "./ServiceCard";
import { Stack, Typography, Box, Container, Grid } from "@mui/material";
import { services } from "./services";

function App() {
  return (
    <Box className="shared-playground" sx={{ minHeight: "100vh", pb: 8 }}>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Stack spacing={6} alignItems="center">
          {/* --- Секция 1: Тест Кнопок --- */}
          <Box sx={{ width: "100%", textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Общие компоненты Hibinka
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

          {/* --- Секция 2: Тест Карточек --- */}
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="h5"
              align="center"
              sx={{ mb: 3, fontWeight: "bold" }}
            >
              Предпросмотр карточек услуг
            </Typography>

            <Grid container spacing={3}>
              {services.map((service, index) => (
                <Grid item xs={12} sm={6} lg={3} key={service.title}>
                  <ServiceCard
                    title={service.title}
                    subtitle={service.subtitle}
                    description={service.description}
                    icon={service.icon}
                    isActive={service.isActive}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
export default App;
