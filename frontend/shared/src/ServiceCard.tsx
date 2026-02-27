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

export const ServiceCard = ({
  title,
  subtitle,
  description,
  icon,
  isActive,
}: any) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const IconWrapper = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Box
        sx={{
          width: 68,
          height: 68,
          bgcolor: "#FFC107",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#333",
          borderRadius: "50%",
          boxShadow: isDark ? "none" : "0px 8px 16px rgba(255, 193, 7, 0.25)",
          transition: "transform 0.3s ease",
          "&:hover": { transform: "scale(1.05)" },
        }}
      >
        {icon}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ position: "relative" }}>
      <Card
        variant="outlined"
        sx={{
          visibility: "hidden",
          pointerEvents: "none",
          opacity: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          borderWidth: isActive ? 2 : 1,
        }}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
          <IconWrapper />
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {subtitle}
          </Typography>
          <MuiButton sx={{ mt: 2, textTransform: "none" }}>
            Узнать больше
          </MuiButton>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: expanded ? "auto" : "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          borderColor: isActive ? "#FFC107" : "divider",
          borderWidth: isActive ? 2 : 1,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: expanded ? 10 : 1,
          bgcolor: "background.paper",
          boxShadow: expanded
            ? isDark
              ? "0px 12px 24px rgba(0, 0, 0, 0.5)"
              : "0px 12px 24px rgba(0, 0, 0, 0.1)"
            : 0,
          "&:hover": {
            boxShadow: expanded
              ? isDark
                ? "0px 12px 24px rgba(0, 0, 0, 0.5)"
                : "0px 12px 24px rgba(0, 0, 0, 0.1)"
              : isDark
                ? "0px 6px 16px rgba(0, 0, 0, 0.2)"
                : "0px 6px 16px rgba(0, 0, 0, 0.06)",
            borderColor: "#FFC107",
            transform: expanded ? "none" : "translateY(-4px)",
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
          <IconWrapper />
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: expanded ? 0 : 2, lineHeight: 1.6 }}
          >
            {subtitle}
          </Typography>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ mt: 2, mb: 2, textAlign: "left", lineHeight: 1.6 }}
            >
              {description}
            </Typography>
          </Collapse>
          <Box sx={{ mt: "auto", pt: 1 }}>
            <MuiButton
              onClick={() => setExpanded(!expanded)}
              endIcon={
                <KeyboardArrowDownIcon
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              }
              sx={{
                color: isDark ? "#fff" : "#333",
                bgcolor: isDark
                  ? "rgba(255, 193, 7, 0.15)"
                  : "rgba(255, 193, 7, 0.1)",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "#FFC107", color: "#000" },
              }}
            >
              {expanded ? "Свернуть" : "Узнать больше"}
            </MuiButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
