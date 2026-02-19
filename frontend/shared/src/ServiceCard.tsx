import { useState, type FC, type ReactNode } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Collapse,
  Button as MuiButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface ServiceCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  isActive?: boolean;
}

export const ServiceCard: FC<ServiceCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  isActive,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const contentStyles = { flexGrow: 1, textAlign: "center", p: 3 };

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
          borderRadius: "50%", // Сделали круглым
          boxShadow: "0px 8px 16px rgba(255, 193, 7, 0.25)",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
        {icon}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ position: "relative" }}>
      {/* Скрытая карточка-плейсхолдер (держит высоту в сетке) */}
      <Card
        variant="outlined"
        sx={{
          visibility: "hidden",
          pointerEvents: "none",
          opacity: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3, // Чуть более мягкие углы
          borderWidth: isActive ? 2 : 1,
        }}
      >
        <CardContent sx={contentStyles}>
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

      {/* Видимая интерактивная карточка */}
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
          borderRadius: 3, // Мягкие углы
          borderColor: isActive ? "#FFC107" : "divider",
          borderWidth: isActive ? 2 : 1,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Более плавная анимация (MUI standard)
          zIndex: expanded ? 10 : 1,
          bgcolor: "background.paper",
          boxShadow: expanded ? "0px 12px 24px rgba(0, 0, 0, 0.1)" : 0,
          "&:hover": {
            boxShadow: expanded
              ? "0px 12px 24px rgba(0, 0, 0, 0.1)"
              : "0px 6px 16px rgba(0, 0, 0, 0.06)",
            borderColor: "#FFC107",
            transform: expanded ? "none" : "translateY(-4px)", // Легкое поднятие при наведении
          },
        }}
      >
        <CardContent sx={contentStyles}>
          <IconWrapper />

          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{ fontWeight: 700, color: "#222" }}
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
              sx={{
                mt: 2,
                mb: 2,
                textAlign: "left",
                lineHeight: 1.6,
                color: "#555",
              }}
            >
              {description}
            </Typography>
          </Collapse>

          {/* Обновленная кнопка с иконкой */}
          <Box sx={{ mt: "auto", pt: 1 }}>
            {" "}
            {/* Выталкиваем кнопку вниз */}
            <MuiButton
              onClick={handleExpandClick}
              endIcon={
                <KeyboardArrowDownIcon
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              }
              sx={{
                color: "#333",
                bgcolor: "rgba(255, 193, 7, 0.1)",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#FFC107",
                  color: "#000",
                },
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
