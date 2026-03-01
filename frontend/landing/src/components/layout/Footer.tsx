import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Collapse,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";

import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import { Button } from "@shared/components/ui/Button";

export const Footer = () => {
  const [showContacts, setShowContacts] = useState(false);
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        py: { xs: 6, md: 8 },
        borderTop: "1px solid",
        borderColor: "divider",
        mt: "auto",
      }}
    >
      <Container maxWidth={false} sx={{ textAlign: "center" }}>
        <Typography variant="h4" fontWeight="900" color="text.primary" mb={1}>
          Хибинка<span style={{ color: theme.palette.primary.main }}>51</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Надежные пассажирские перевозки по всей области
        </Typography>

        <Button
          variant={showContacts ? "outlined" : "contained"}
          color="primary"
          onClick={() => setShowContacts(!showContacts)}
          sx={{
            mb: 4,
            px: 4,
            py: 1.5,
            color: showContacts ? "text.primary" : "#1a1a1a",
            borderColor: "primary.main",
            transition: "all 0.3s ease",
            ...(theme.palette.mode === "dark" &&
              !showContacts && {
                boxShadow: "0 0 24px rgba(244, 196, 48, 0.4)",
                "&:hover": { boxShadow: "0 0 32px rgba(244, 196, 48, 0.6)" },
              }),
          }}
        >
          {showContacts ? "Скрыть контакты" : "Связаться с нами"}
        </Button>

        <Collapse in={showContacts}>
          <Grid
            container
            spacing={4}
            justifyContent="center"
            sx={{
              textAlign: "left",
              maxWidth: "800px",
              mx: "auto",
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              p: { xs: 3, md: 4 },
              borderRadius: "24px",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <PhoneOutlinedIcon color="primary" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Диспетчер
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="700" color="text.primary">
                +7 (953) 304-78-44
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Инна
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <EmailOutlinedIcon color="primary" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Электронная почта
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="700" color="text.primary">
                in.kom.2010@mail.ru
              </Typography>
              <Typography variant="body2" color="text.secondary">
                По вопросам сотрудничества
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <TelegramIcon color="primary" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Мессенджеры
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Typography
                  variant="body1"
                  fontWeight="700"
                  color="text.primary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <TelegramIcon fontSize="small" /> Telegram
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="700"
                  color="text.primary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <WhatsAppIcon fontSize="small" /> WhatsApp
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Collapse>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 6 }}
        >
          © {new Date().getFullYear()} Hibinka51. Все права защищены.
        </Typography>
      </Container>
    </Box>
  );
};
