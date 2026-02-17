import { useState, type FC, type ReactNode } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Collapse,
  Button as MuiButton,
} from "@mui/material";

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
        mb: 2,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          bgcolor: "#FFC107",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#333",
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
          borderRadius: 2,
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
          borderRadius: 2,
          borderColor: isActive ? "#FFC107" : "divider",
          borderWidth: isActive ? 2 : 1,
          transition: "all 0.3s ease",
          zIndex: expanded ? 10 : 1,
          bgcolor: "background.paper",
          boxShadow: expanded ? 6 : 0,
          "&:hover": {
            boxShadow: 3,
            borderColor: "#FFC107",
          },
        }}
      >
        <CardContent sx={contentStyles}>
          <IconWrapper />
          {/**Заголовок */}
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
          {/**Подзаголовок */}
          <Typography variant="body2" color="text.secondary" paragraph>
            {subtitle}
          </Typography>
          {/**Скрытый контент */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ mt: 2, mb: 2, textAlign: "justify" }}
            >
              {description}
            </Typography>
          </Collapse>

          {/**Кнопка переключения */}
          <MuiButton
            onClick={handleExpandClick}
            sx={{
              mt: 2,
              color: "#FFC107",
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(255, 193, 7, 0.08)" },
            }}
          >
            {expanded ? "Показать меньше" : "Узнать больше"}
          </MuiButton>
        </CardContent>
      </Card>
    </Box>
  );
};
