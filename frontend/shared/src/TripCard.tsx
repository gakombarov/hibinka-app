import { FC, ElementType } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Chip,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export type TripStatus = "SCHEDULED" | "ON THE WAY";

export type TripStatus = "SCHEDULED" | "ON THE WAY";

export interface TripStop {
  location: string;
  time?: string;
}

export interface TripCardProps {
  departureTime: string;
  price: number;
  routeType: string;
  RouteIcon: ElementType;
  notes?: string;
  stops: TripStop[];
}

export const TripCard: FC<TripCardProps> = ({
  departureTime,
  price,
  routeType,
  RouteIcon,
  notes,
  stops,
}) => {
  const isScheduled = status === "SCHEDULED";
  const statusColor = isScheduled ? "success.main" : "primary.main";
  const statusTextColor = isScheduled ? "#ffffff" : "#1a1a1a";

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "scretch", md: "center" },
        justifyContent: "space-between",
        p: 2,
        borderRadius: 2,
      }}
    ></Card>
  );
};
