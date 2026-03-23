import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";

const DRAWER_WIDTH = 280;

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      text: "Журнал поездок",
      path: "/dashboard/trips",
      icon: <DirectionsCarIcon />,
    },
    {
      text: "Новые заявки",
      path: "/dashboard/bookings",
      icon: <ListAltIcon />,
    },
    {
      text: "Расписание",
      path: "/dashboard/schedule",
      icon: <EventRepeatIcon />,
    },
    {
      text: "База клиентов",
      path: "/dashboard/customers",
      icon: <PeopleIcon />,
    },
  ];

  const drawerContent = (
    <>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight="bold"
          textTransform="uppercase"
        >
          Управление
        </Typography>
      </Box>
      <Divider />
      <List sx={{ p: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: "8px",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.dark" },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "inherit" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ЛЕВАЯ ЧАСТЬ: Боковое меню для МОБИЛОК (выдвижное) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ЛЕВАЯ ЧАСТЬ: Боковое меню для ДЕСКТОПА (фиксированное) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            position: "sticky",
            top: 70,
            height: "calc(100vh - 70px)",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* ПРАВАЯ ЧАСТЬ: Рабочая область */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        {/* Кнопка-бургер для мобилок */}
        {isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, bgcolor: "action.hover" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              Меню управления
            </Typography>
          </Box>
        )}

        <Outlet />
      </Box>
    </Box>
  );
};
