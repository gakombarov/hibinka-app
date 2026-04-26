import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Container,
  useTheme,
  alpha,
} from "@mui/material";

import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LoginIcon from "@mui/icons-material/Login";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { Button } from "@shared/components/ui/Button";

interface HeaderProps {
  mode: "light" | "dark";
  toggleTheme: () => void;
  user: { name: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onGoToDashboard: () => void;
  onGoToLanding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  toggleTheme,
  user,
  onLoginClick,
  onLogout,
  onGoToDashboard,
  onGoToLanding,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: "blur(12px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundImage: "none",
        zIndex: 1100,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            height: { xs: "60px", md: "70px" },
          }}
        >
          <Box
            onClick={onGoToLanding}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                p: { xs: 0.5, md: 1 },
                borderRadius: "8px",
                display: "flex",
              }}
            >
              <DirectionsBusIcon
                sx={{ color: "#1a1a1a", fontSize: { xs: 20, md: 24 } }}
              />
            </Box>
            <Typography
              variant="h6"
              fontWeight="900"
              color="text.primary"
              sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
            >
              HIBINKA51
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: "text.secondary",
                bgcolor: alpha(theme.palette.text.primary, 0.05),
              }}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {user ? (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleMenuClick}
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    borderColor: "transparent",
                    "&:hover": { borderColor: "divider" },
                  }}
                >
                  <PersonOutlineIcon sx={{ mr: 1, fontSize: 20 }} />
                  {user.name}
                </Button>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    display: { xs: "flex", sm: "none" },
                    color: "text.secondary",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                  }}
                >
                  <PersonOutlineIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  PaperProps={{
                    sx: {
                      borderRadius: "16px",
                      mt: 1,
                      minWidth: 200,
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 10px 30px rgba(0,0,0,0.5)"
                          : "0 10px 30px rgba(0,0,0,0.1)",
                      bgcolor: "background.paper",
                      backgroundImage: "none",
                      border: "1px solid",
                      borderColor: "divider",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      onGoToDashboard();
                    }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <DirectionsBusIcon
                      sx={{ mr: 1.5, color: "text.secondary", fontSize: 20 }}
                    />
                    <Typography variant="body2" fontWeight="600">
                      Журнал рейсов
                    </Typography>
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      onLogout();
                    }}
                    sx={{
                      py: 1.5,
                      px: 2,
                      color: "error.main",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                      },
                    }}
                  >
                    <LoginIcon
                      sx={{
                        mr: 1.5,
                        color: "inherit",
                        fontSize: 20,
                        transform: "rotate(180deg)",
                      }}
                    />
                    <Typography variant="body2" fontWeight="600">
                      Выйти
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  endIcon={<LoginIcon />}
                  onClick={onLoginClick}
                  sx={{ display: { xs: "none", sm: "flex" } }}
                >
                  Войти
                </Button>
                <IconButton
                  onClick={onLoginClick}
                  sx={{
                    display: { xs: "flex", sm: "none" },
                    color: "text.secondary",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                  }}
                >
                  <LoginIcon />
                </IconButton>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
