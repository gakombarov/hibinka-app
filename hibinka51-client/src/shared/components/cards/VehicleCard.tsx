import React from "react";
import { Card, Typography, Stack, Box } from "@mui/material";
import { Vehicle } from "../../shared/types/api";

export const VEHICLE_CATEGORY_LABELS: Record<string, string> = {
    CAR: "Легковая",
    MINIBUS: "Микроавтобус",
    BUS: "Автобус",
};

interface VehicleCardProps {
    vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
    return (
        <Card sx={{ p: 2, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography
                        variant="caption"
                        sx={{
                            bgcolor: "#F5F5F5",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 700,
                            color: "text.secondary"
                        }}
                    >
                        {VEHICLE_CATEGORY_LABELS[vehicle.category] || vehicle.category}
                    </Typography>
                </Box>
                <Typography variant="h6" fontWeight="800">
                    {vehicle.alias || `${vehicle.brand} ${vehicle.model}`}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                    {vehicle.license_plate} • {vehicle.capacity} мест
                </Typography>
            </Stack>
        </Card>
    );
};