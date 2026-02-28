import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  Button as MuiButton,
  useTheme,
  alpha,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export const ServiceCard = ({ title, subtitle, description, icon }: any) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "24px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        backgroundImage: "none",
        boxShadow: expanded
          ? `0px 12px 24px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.3 : 0.08)}`
          : "none",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        "&:hover": {
          borderColor: "primary.main",
          transform: expanded ? "none" : "translateY(-6px)",
          boxShadow: `0px 12px 30px ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.15 : 0.1)}`,
          "& .icon-wrapper": {
            transform: "scale(1.1) translateY(-4px)",
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
        },
      }}
      elevation={0}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          p: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            className="icon-wrapper"
            sx={{
              width: 68,
              height: 68,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #D4A017 100%)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#1a1a1a",
              borderRadius: "22px",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography
          variant="h6"
          fontWeight="700"
          color="text.primary"
          gutterBottom
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>

        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
          sx={{ width: "100%" }}
        >
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              mb: 3,
              textAlign: "left",
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        </Collapse>

        <Box sx={{ mt: "auto", pt: 1, width: "100%" }}>
          <MuiButton
            onClick={() => setExpanded(!expanded)}
            endIcon={
              <KeyboardArrowDownIcon
                sx={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            }
            sx={{
              width: "100%",
              color: "text.primary",
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "primary.main",
                color: "#1a1a1a",
                transform: "scale(1.02)",
              },
            }}
          >
            {expanded ? "Свернуть" : "Узнать больше"}
          </MuiButton>
        </Box>
      </CardContent>
    </Card>
  );
};
