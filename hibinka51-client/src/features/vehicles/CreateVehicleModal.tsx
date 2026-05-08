import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { createVehicle, updateVehicle } from "../../store/vehiclesSlice";
import { Vehicle } from "../../shared/types/api";

interface CreateVehicleModalProps {
    open: boolean;
    onClose: () => void;
    vehicleToEdit?: Vehicle | null;
}

const CATEGORIES = [
    { value: "CAR", label: "Легковая" },
    { value: "MINIBUS", label: "Микроавтобус" },
    { value: "BUS", label: "Автобус" },
];

export const CreateVehicleModal: React.FC<CreateVehicleModalProps> = ({
    open,
    onClose,
    vehicleToEdit,
}) => {
    const dispatch = useDispatch<AppDispatch>();

    const [formData, setFormData] = useState<Partial<Vehicle>>({
        alias: "",
        brand: "",
        model: "",
        license_plate: "",
        capacity: 1,
        category: "CAR",
        is_active: true,
    });

    useEffect(() => {
        if (open) {
            if (vehicleToEdit) {
                setFormData({
                    ...vehicleToEdit,
                });
            } else {
                setFormData({
                    alias: "",
                    brand: "",
                    model: "",
                    license_plate: "",
                    capacity: 1,
                    category: "CAR",
                    is_active: true,
                });
            }
        }
    }, [vehicleToEdit, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "capacity" ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            if (vehicleToEdit?.id) {
                await dispatch(updateVehicle({ id: vehicleToEdit.id, data: formData })).unwrap();
            } else {
                await dispatch(createVehicle(formData as Vehicle)).unwrap();
            }
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle fontWeight="800">
                {vehicleToEdit ? "Редактировать транспорт" : "Новый транспорт"}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} mt={1}>
                    <TextField
                        name="alias"
                        label="Алиас (Название для отображения)"
                        value={formData.alias || ""}
                        onChange={handleChange}
                        fullWidth
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            name="brand"
                            label="Марка"
                            value={formData.brand || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            name="model"
                            label="Модель"
                            value={formData.model || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Stack>
                    <TextField
                        name="license_plate"
                        label="Гос. номер"
                        value={formData.license_plate || ""}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            name="capacity"
                            label="Вместимость (мест)"
                            type="number"
                            value={formData.capacity}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            select
                            name="category"
                            label="Категория"
                            value={formData.category || "CAR"}
                            onChange={handleChange}
                            fullWidth
                            required
                        >
                            {CATEGORIES.map((c) => (
                                <MenuItem key={c.value} value={c.value}>
                                    {c.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                        bgcolor: "#FFD60A",
                        color: "black",
                        fontWeight: 800,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#E5C009", boxShadow: "none" },
                    }}
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};