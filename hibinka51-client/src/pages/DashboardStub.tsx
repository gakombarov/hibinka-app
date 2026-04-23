import React from "react";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@shared/components/ui/Button";

interface DashboardStubProps {
  onBack: () => void;
}

export const DashboardStub: React.FC<DashboardStubProps> = ({ onBack }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      height: "100vh",
      width: "100%",
    }}
  >
    {/* Боковое меню только для десктопа */}
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          position: "static",
        },
      }}
    >
      <List>
        <ListItem key="back" disablePadding>
          <ListItemButton onClick={onBack}>
            <ListItemIcon>
              <ArrowBackIcon />
            </ListItemIcon>
            <ListItemText primary="Вернуться на сайт" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>

    {/* Основной контент */}
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        p: { xs: 2, md: 4 },
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Кнопка "Назад" для мобилок */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "absolute",
          top: 16,
          left: 16,
        }}
      >
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
        >
          На сайт
        </Button>
      </Box>

      <Typography variant="h6" color="text.secondary" textAlign="center">
        Раздел находится в разработке...
      </Typography>
    </Box>
  </Box>
);
