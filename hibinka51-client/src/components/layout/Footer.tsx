import React from "react";
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Link,
  Divider,
} from "@mui/material";

import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        pt: 6,
        pb: 4,
        mt: "auto",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* ЛЕВЫЙ БЛОК: Кратко о компании */}
          <Grid item xs={12} md={5}>
            <Typography
              variant="h6"
              fontWeight="900"
              color="text.primary"
              gutterBottom
            >
              HIBINKA51
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 400, lineHeight: 1.6 }}
            >
              Надежные пассажирские перевозки по Мурманской области. Трансферы в
              аэропорт, Кировск, Териберку, а также корпоративное обслуживание.
            </Typography>
          </Grid>

          {/* ПРАВЫЙ БЛОК: Строгие контакты */}
          <Grid item xs={12} md={5}>
            <Typography
              variant="subtitle1"
              fontWeight="700"
              color="text.primary"
              gutterBottom
            >
              Связаться с нами
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Телефон Инны */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Link
                  href="tel:+79533047844"
                  underline="none"
                  color="text.secondary"
                  sx={{
                    "&:hover": { color: "primary.main" },
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                >
                  +7 (953) 304-78-44 (Инна)
                </Link>
              </Box>

              {/* Телефон Саши */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Link
                  href="tel:+79211534636"
                  underline="none"
                  color="text.secondary"
                  sx={{
                    "&:hover": { color: "primary.main" },
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                >
                  +7 (921) 153-46-36 (Александр)
                </Link>
              </Box>

              {/* Почта */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon fontSize="small" color="action" />
                <Link
                  href="mailto:in.kom.2010@mail.ru"
                  underline="none"
                  color="text.secondary"
                  sx={{
                    "&:hover": { color: "primary.main" },
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                >
                  in.kom.2010@mail.ru
                </Link>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Разделительная линия */}
        <Divider sx={{ my: 4 }} />

        {/* Копирайт */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} HIBINKA51. Все права защищены.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
