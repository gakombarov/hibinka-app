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
      height: "100vh",
      width: "100vw",
    }}
  >
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
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
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.primary",
        flexDirection: "column",
        p: 4,
        height: "100%",
        width: "100%",
      }}
    >
      <Typography variant="h6" color="text.secondary" textAlign="center">
        Раздел находится в разработке...
      </Typography>
    </Box>
  </Box>
);
