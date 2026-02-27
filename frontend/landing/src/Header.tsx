import React from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";

interface HeaderProps {
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  scrollToSection: (id: string) => void;
  anchorEl: null | HTMLElement;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onLogin,
  onLogout,
  scrollToSection,
  anchorEl,
  onMenuOpen,
  onMenuClose,
  toggleTheme,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isDark ? "rgba(5,5,5,0.85)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", height: 80 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#F4C430",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DirectionsBusIcon sx={{ color: "#1a1a1a" }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: theme.palette.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              Hibinka<span style={{ color: "#F4C430" }}>App</span>
            </Typography>
          </Box>

          <Stack direction="row" spacing={4} alignItems="center">
            <Typography
              variant="body1"
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                color: theme.palette.text.secondary,
                display: { xs: "none", md: "block" },
                "&:hover": { color: "#F4C430" },
              }}
              onClick={() => scrollToSection("services")}
            >
              Сервисы
            </Typography>
            <Typography
              variant="body1"
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                color: theme.palette.text.secondary,
                display: { xs: "none", md: "block" },
                "&:hover": { color: "#F4C430" },
              }}
              onClick={() => scrollToSection("schedule")}
            >
              Расписание
            </Typography>

            <Button
              variant="outlined"
              sx={{
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                display: { xs: "none", sm: "flex" },
              }}
              onClick={() => scrollToSection("booking-static")}
            >
              Оставить заявку
            </Button>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                height: 32,
                my: "auto",
                borderColor: theme.palette.divider,
              }}
            />

            <Tooltip title={`Включить ${isDark ? "светлую" : "темную"} тему`}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: theme.palette.text.secondary,
                  bgcolor: alpha(theme.palette.text.primary, 0.05),
                }}
              >
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {isAdmin ? (
              <Box>
                <Button
                  onClick={onMenuOpen}
                  sx={{
                    p: 0.5,
                    borderRadius: "14px",
                    bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#F5F7FA",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ px: 1 }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "#F4C430",
                        color: "#1a1a1a",
                        fontWeight: 800,
                      }}
                    >
                      ИА
                    </Avatar>
                    <Box
                      sx={{
                        textAlign: "left",
                        display: { xs: "none", md: "block" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: theme.palette.text.primary,
                        }}
                      >
                        Иван Админов
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#F4C430",
                          display: "block",
                          mt: -0.5,
                          fontWeight: 700,
                        }}
                      >
                        Администратор
                      </Typography>
                    </Box>
                    <KeyboardArrowDownIcon
                      sx={{ color: theme.palette.text.secondary }}
                    />
                  </Stack>
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={onMenuClose}
                  PaperProps={{
                    sx: {
                      bgcolor: theme.palette.background.paper,
                      mt: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      minWidth: 200,
                      borderRadius: "16px",
                    },
                  }}
                >
                  <MenuItem
                    onClick={onMenuClose}
                    sx={{
                      gap: 2,
                      py: 1.5,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    <DashboardIcon fontSize="small" sx={{ color: "#F4C430" }} />{" "}
                    Дашборд
                  </MenuItem>
                  <Divider sx={{ opacity: 0.1 }} />
                  <MenuItem
                    onClick={onLogout}
                    sx={{ gap: 2, py: 1.5, color: "#E53E3E", fontWeight: 600 }}
                  >
                    <LogoutIcon fontSize="small" /> Выйти
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button variant="contained" color="primary" onClick={onLogin}>
                Войти
              </Button>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
