import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
    Chip,
    alpha
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchVehicles, updateVehicle, deleteVehicle } from "../store/vehiclesSlice";
import { Vehicle } from "../shared/types/api";

import { CreateVehicleModal } from "../features/vehicles/CreateVehicleModal";

const COLORS = {
    PAGE_BG: "#F2F2F7",
    ACCENT_YELLOW: "#FFD60A",
    CARD_BG: "#FFFFFF",
    BORDER: "rgba(0,0,0,0.05)",
    TEXT_MAIN: "#1D1D1F",
    TEXT_SECONDARY: "#86868B"
};

const CATEGORY_LABELS: Record<string, string> = {
    "CAR": "Легковая",
    "MINIBUS": "Микроавтобус",
    "BUS": "Автобус"
};

export const VehiclesPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const dispatch = useDispatch<AppDispatch>();

    const { items: vehicles, loading } = useSelector((state: RootState) => state.vehicles);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    useEffect(() => {
        dispatch(fetchVehicles());
    }, [dispatch]);

    const handleToggleActive = async (vehicle: Vehicle) => {
        try {
            await dispatch(updateVehicle({ id: vehicle.id, data: { is_active: !vehicle.is_active } })).unwrap();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Удалить это транспортное средство?")) {
            try {
                await dispatch(deleteVehicle(id)).unwrap();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const openEditModal = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setEditingVehicle(null);
        setModalOpen(false);
        dispatch(fetchVehicles());
    };

    const MobileVehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
        <Paper elevation={0} sx={{
            p: 2, mb: 2, borderRadius: "18px",
            border: `1px solid ${COLORS.BORDER}`,
            bgcolor: COLORS.CARD_BG
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <DirectionsCarIcon sx={{ color: vehicle.is_active ? COLORS.ACCENT_YELLOW : COLORS.TEXT_SECONDARY }} />
                    <Typography fontWeight="900" fontSize="1.1rem" color={COLORS.TEXT_MAIN}>
                        {vehicle.alias || `${vehicle.brand} ${vehicle.model}`}
                    </Typography>
                </Stack>
                <Switch
                    checked={vehicle.is_active}
                    onChange={() => handleToggleActive(vehicle)}
                    color="warning"
                />
            </Stack>

            <Divider sx={{ my: 1.5, opacity: 0.5 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, fontWeight: 700, display: 'block' }}>ГОС. НОМЕР</Typography>
                    <Chip
                        label={vehicle.license_plate}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 800, borderRadius: "6px", mt: 0.5, borderStyle: 'dashed' }}
                    />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, fontWeight: 700, display: 'block' }}>МЕСТ</Typography>
                    <Typography fontWeight="900" fontSize="1.1rem" color={COLORS.TEXT_MAIN}>
                        {vehicle.capacity}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: COLORS.TEXT_SECONDARY, fontWeight: 700, display: 'block' }}>КАТЕГОРИЯ</Typography>
                    <Typography fontWeight="800" fontSize="0.85rem" color={COLORS.TEXT_MAIN} sx={{ mt: 0.5 }}>
                        {CATEGORY_LABELS[vehicle.category] || vehicle.category}
                    </Typography>
                </Box>
            </Stack>

            <Stack direction="row" spacing={1} mt={2}>
                <Button
                    fullWidth size="small" variant="outlined" startIcon={<EditIcon />}
                    onClick={() => openEditModal(vehicle)}
                    sx={{ borderRadius: "10px", fontWeight: 800, color: COLORS.TEXT_MAIN, borderColor: COLORS.BORDER }}
                >
                    Изменить
                </Button>
                <IconButton
                    size="small"
                    onClick={() => handleDelete(vehicle.id)}
                    sx={{ bgcolor: alpha('#FF3B30', 0.1), color: '#FF3B30', borderRadius: "10px" }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Stack>
        </Paper>
    );

    const cellSx = {
        padding: "16px",
        borderBottom: `1px solid ${COLORS.BORDER}`,
    };

    if (loading && vehicles.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: isMobile ? 2 : 4, bgcolor: COLORS.PAGE_BG, minHeight: "100vh" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={isMobile ? 2 : 4}>
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="900" sx={{ letterSpacing: "-0.04em", color: "#1D1D1F" }}>
                    Автопарк
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setEditingVehicle(null); setModalOpen(true); }}
                    sx={{
                        bgcolor: COLORS.ACCENT_YELLOW,
                        color: 'black',
                        fontWeight: 800,
                        borderRadius: "12px",
                        boxShadow: 'none',
                        '&:hover': { bgcolor: alpha(COLORS.ACCENT_YELLOW, 0.8), boxShadow: 'none' }
                    }}
                >
                    {isMobile ? "Добавить" : "Добавить транспорт"}
                </Button>
            </Stack>

            {isMobile ? (
                <Box>
                    {vehicles.map(v => (
                        <MobileVehicleCard key={v.id} vehicle={v} />
                    ))}
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", border: `1px solid ${COLORS.BORDER}` }}>
                    <Table>
                        <TableHead sx={{ bgcolor: "#FBFBFC" }}>
                            <TableRow sx={{ "& th": { fontWeight: 800, fontSize: "0.75rem", color: "#86868B", textTransform: 'uppercase' } }}>
                                <TableCell>Название / Марка</TableCell>
                                <TableCell>Гос. номер</TableCell>
                                <TableCell align="center">Вместимость</TableCell>
                                <TableCell>Категория</TableCell>
                                <TableCell align="center">Статус</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vehicles.map((v) => (
                                <TableRow key={v.id} sx={{ "&:hover": { bgcolor: alpha(COLORS.ACCENT_YELLOW, 0.05) } }}>
                                    <TableCell sx={cellSx}>
                                        <Typography fontWeight="900" color={COLORS.TEXT_MAIN}>{v.alias || v.brand}</Typography>
                                        <Typography variant="caption" color={COLORS.TEXT_SECONDARY} fontWeight="700">{v.model}</Typography>
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        <Chip label={v.license_plate} size="small" variant="outlined" sx={{ fontWeight: 800, borderRadius: "6px" }} />
                                    </TableCell>
                                    <TableCell align="center" sx={cellSx}>
                                        <Typography fontWeight="900">{v.capacity}</Typography>
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        <Typography fontWeight="800" fontSize="0.85rem">
                                            {CATEGORY_LABELS[v.category] || v.category}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={cellSx}>
                                        <Switch checked={v.is_active} onChange={() => handleToggleActive(v)} color="warning" />
                                    </TableCell>
                                    <TableCell align="right" sx={cellSx}>
                                        <IconButton onClick={() => openEditModal(v)} sx={{ color: COLORS.TEXT_SECONDARY }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(v.id)} sx={{ color: '#FF3B30' }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {isModalOpen && (
                <CreateVehicleModal
                    open={isModalOpen}
                    onClose={handleModalClose}
                    vehicleToEdit={editingVehicle}
                />
            )}
        </Box>
    );
};