import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import PeopleIcon from "@mui/icons-material/People";

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        gap: 4,
        flexGrow: 1,
        alignItems: "flex-start",
      }}
    >
      {/* ЛЕВАЯ ЧАСТЬ: Боковое меню */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          width: 280,
          flexShrink: 0,
          borderRadius: "16px",
          overflow: "hidden",
          position: "sticky",
          top: 24,
        }}
      >
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
                  onClick={() => navigate(item.path)}
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
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* ПРАВАЯ ЧАСТЬ: Рабочая область*/}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
