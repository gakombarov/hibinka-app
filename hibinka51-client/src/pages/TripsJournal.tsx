import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    alpha,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputBase,
    List,
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import dayjs, {Dayjs} from "dayjs";
import "dayjs/locale/ru";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import {tripsApi} from "../api/trips";
import {TripResponse} from "../shared/types/api";
import {AssignVehicleModal} from "../features/trips/AssignVehicleModal";
import {vehiclesApi} from "../api/vehicles";
import {driversApi} from "../api/drivers";

const COLORS = {
    PAGE_BG: "#F2F2F7",
    ACCENT_YELLOW: "#FFD60A",
    CARD_BG: "#FFFFFF",
    PALE_YELLOW: "#FFFBEB",
    BORDER: "rgba(0,0,0,0.05)",
    TEXT_MAIN: "#1D1D1F",
    TEXT_SECONDARY: "#86868B",
    SUCCESS_GREEN: "#34C759"
};

const COLS = {
    TIME: 80, ROUTE: 300, CLIENT: 180, PASS: 60,
    TRAIL: 50, AUTO: 140, DRIVER: 140, PAID: 110,
    TOTAL: 95, STATUS: 150,
};

interface AssignDriverModalProps {
    open: boolean;
    onClose: () => void;
    drivers: any;
    onAssign: (driverId: string) => void;
}

const AssignDriverModal: React.FC<AssignDriverModalProps> = ({open, onClose, drivers, onAssign}) => {
    const driversList = useMemo(() => {
        if (!drivers) return [];
        if (Array.isArray(drivers)) return drivers;
        if (drivers && typeof drivers === 'object' && Array.isArray(drivers.items)) {
            return drivers.items;
        }
        return [];
    }, [drivers]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{sx: {borderRadius: "16px"}}}>
            <DialogTitle sx={{fontWeight: 900, pb: 1}}>Назначить водителя</DialogTitle>
            <DialogContent sx={{p: 0}}>
                <List sx={{pt: 0, pb: 1}}>
                    <ListItemButton
                        onClick={() => onAssign("")}
                        sx={{py: 1.5, borderBottom: `1px solid ${COLORS.BORDER}`}}
                    >
                        <ListItemText
                            primary="Снять водителя"
                            primaryTypographyProps={{fontWeight: 800, color: "error.main"}}
                        />
                    </ListItemButton>
                    {driversList.length === 0 ? (
                        <Box sx={{p: 3, textAlign: 'center'}}>
                            <Typography color="text.secondary" fontWeight="bold">Водители не найдены</Typography>
                        </Box>
                    ) : (
                        driversList.map((d: any) => (
                            <ListItemButton
                                key={d.id}
                                onClick={() => onAssign(d.id)}
                                sx={{
                                    py: 1.5,
                                    borderBottom: `1px solid ${COLORS.BORDER}`,
                                    '&:last-child': {borderBottom: 'none'}
                                }}
                            >
                                <ListItemText
                                    primary={d.call_sign || "Без позывного"}
                                    secondary={d.phone || ""}
                                    primaryTypographyProps={{fontWeight: 800}}
                                    secondaryTypographyProps={{fontWeight: 600, color: COLORS.TEXT_SECONDARY}}
                                />
                            </ListItemButton>
                        ))
                    )}
                </List>
            </DialogContent>
        </Dialog>
    );
};

export const TripsJournal: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any>([]);
    const [trips, setTrips] = useState<TripResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCancelled, setShowCancelled] = useState(() => {
        return localStorage.getItem('showCancelledTrips') === 'true';
    });

    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<{
        date_from: Dayjs | null;
        date_to: Dayjs | null;
        status: string;
        has_trailer: string;
        is_regular: string;
        payment_status: string;
        passenger_count: string;
        paid_amount: string;
    }>({
        date_from: null,
        date_to: null,
        status: '',
        has_trailer: '',
        is_regular: '',
        payment_status: '',
        passenger_count: '',
        paid_amount: '',
    });

    const [assignModal, setAssignModal] = useState<{
        open: boolean;
        tripId: string | null;
        currentVehicle: any | null
    }>({
        open: false,
        tripId: null,
        currentVehicle: null
    });

    const [assignDriverModal, setAssignDriverModal] = useState<{
        open: boolean;
        tripId: string | null;
        currentDriver: any | null
    }>({
        open: false,
        tripId: null,
        currentDriver: null
    });

    const buildApiFilters = () => {
        const f: Record<string, any> = {};
        if (filters.date_from) f.date_from = filters.date_from.format('YYYY-MM-DD');
        if (filters.date_to) f.date_to = filters.date_to.format('YYYY-MM-DD');
        if (filters.status) f.status = filters.status;
        if (filters.has_trailer !== '') f.has_trailer = filters.has_trailer === 'true';
        if (filters.is_regular !== '') f.is_regular = filters.is_regular === 'true';
        if (filters.payment_status) f.payment_status = filters.payment_status;
        if (filters.passenger_count) f.passenger_count = Number(filters.passenger_count);
        if (filters.paid_amount) f.paid_amount = Number(filters.paid_amount);
        return f;
    };

    const loadData = async (includeCancelled: boolean, activeFilters = buildApiFilters()) => {
        try {
            setLoading(true);
            const [tripsData, vehiclesData, driversData] = await Promise.all([
                tripsApi.getAll(includeCancelled, activeFilters),
                vehiclesApi.getAll(),
                driversApi.getAll().catch(() => [])
            ]);
            setTrips(tripsData);
            setVehicles(vehiclesData);
            setDrivers(driversData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        localStorage.setItem('showCancelledTrips', String(showCancelled));
        loadData(showCancelled);
    }, [showCancelled]);

    const handleUpdate = async (id: string, data: any) => {
        setTrips(prev => prev.map(t => t.id === id ? {...t, ...data} : t));
        try {
            await tripsApi.update(id, data);
            if (data.status && data.status === "CANCELLED" && !showCancelled) {
                await loadData(showCancelled);
            }
        } catch (e) {
            await loadData(showCancelled);
        }
    };

    const handleAssignVehicle = async (vehicleId: string, split: boolean) => {
        if (!assignModal.tripId) return;
        try {
            await tripsApi.assignVehicle(assignModal.tripId, vehicleId, split);
            await loadData(showCancelled);
        } catch (e: any) {
            alert(`Ошибка: ${e.response?.data?.detail || "Не удалось назначить машину"}`);
            await loadData(showCancelled);
        } finally {
            setAssignModal({open: false, tripId: null, currentVehicle: null});
        }
    };

    const handleAssignDriver = async (driverId: string) => {
        if (!assignDriverModal.tripId) return;
        try {
            await tripsApi.assignDriver(assignDriverModal.tripId, driverId || null);
            await loadData(showCancelled);
        } catch (e: any) {
            alert(`Ошибка: ${e.response?.data?.detail || "Не удалось назначить водителя"}`);
            await loadData(showCancelled);
        } finally {
            setAssignDriverModal({open: false, tripId: null, currentDriver: null});
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return {color: "success" as const, label: "Завершен"};
            case "IN_PROGRESS":
                return {color: "warning" as const, label: "В пути"};
            case "CANCELLED":
                return {color: "error" as const, label: "Отменен"};
            default:
                return {color: "info" as const, label: "Ожидание"};
        }
    };

    const filteredTrips = useMemo(() => {
        if (!search.trim()) return trips;
        const q = search.toLowerCase();
        return trips.filter(t =>
            t.departure_location?.toLowerCase().includes(q) ||
            t.arrival_location?.toLowerCase().includes(q) ||
            t.customer?.first_name?.toLowerCase().includes(q) ||
            t.customer?.phone?.toLowerCase().includes(q) ||
            (t as any).scheduled_trip?.client_name?.toLowerCase().includes(q)
        );
    }, [trips, search]);

    const groupedTrips = useMemo(() => {
        const groups: Record<string, TripResponse[]> = {};
        filteredTrips.forEach(t => {
            if (!groups[t.trip_date]) groups[t.trip_date] = [];
            groups[t.trip_date].push(t);
        });
        return groups;
    }, [filteredTrips]);

    const cellSx = {
        padding: "10px 12px", borderRight: `1px solid ${COLORS.BORDER}`,
        borderBottom: `1px solid ${COLORS.BORDER}`, "&:last-child": {borderRight: "none"}
    };

    const inputSx = {
        "& .MuiInputBase-input": {
            fontSize: "0.9rem", fontWeight: 800, textAlign: "center", borderRadius: "8px", padding: "4px",
            "&:hover": {bgcolor: "rgba(0,0,0,0.03)"}
        },
        "& .MuiInputBase-root": {"&:before, &:after": {display: "none"}}
    };

    const getAssignButtonProps = (isAssigned: boolean) => ({
        variant: isAssigned ? "contained" : "outlined" as const,
        sx: {
            borderRadius: "10px", fontWeight: 800, fontSize: isMobile ? "0.7rem" : "0.65rem",
            borderStyle: isAssigned ? 'solid' : 'dashed', color: isAssigned ? '#000' : "#515154",
            bgcolor: isAssigned ? COLORS.ACCENT_YELLOW : 'transparent', boxShadow: 'none',
            '&:hover': {bgcolor: isAssigned ? alpha(COLORS.ACCENT_YELLOW, 0.8) : 'rgba(0,0,0,0.04)', boxShadow: 'none'}
        }
    });

    const MobileTripCard = ({trip}: { trip: TripResponse }) => {
        const isFullyPaid = Number(trip.paid_amount) >= Number(trip.total_amount);
        const isContractTrip = Boolean((trip as any).scheduled_trip_id);

        const vehiclesList = Array.isArray(vehicles) ? vehicles : ((vehicles as any).items || []);
        const vehicleObj = (trip as any).vehicle || vehiclesList.find((v: any) => v.id === (trip as any).vehicle_id);
        const isVehicleAssigned = !!vehicleObj;
        const vehicleDisplay = vehicleObj ? (vehicleObj.alias || vehicleObj.license_plate) : "Выбрать авто";

        const driversList = Array.isArray(drivers) ? drivers : ((drivers as any).items || []);
        const driverObj = (trip as any).driver || driversList.find((d: any) => d.id === (trip as any).driver_id);
        const isDriverAssigned = !!driverObj;
        const driverDisplay = driverObj ? (driverObj.call_sign || "Водитель") : "Водитель";

        return (
            <Paper elevation={0} sx={{
                p: 2, mb: 2, borderRadius: "18px",
                border: `1px solid ${COLORS.BORDER}`, bgcolor: COLORS.CARD_BG,
                opacity: trip.status === 'CANCELLED' ? 0.6 : 1
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AccessTimeIcon sx={{fontSize: 20, color: COLORS.ACCENT_YELLOW}}/>
                        <Typography variant="h6" fontWeight="900" sx={{color: COLORS.TEXT_MAIN}}>
                            {trip.departure_time.slice(0, 5)}
                        </Typography>
                    </Stack>
                    <Select
                        value={trip.status} size="small" variant="standard" disableUnderline
                        onChange={(e) => handleUpdate(trip.id, {status: e.target.value})}
                        renderValue={(v) => {
                            const cfg = getStatusConfig(v as string);
                            return <Chip label={cfg.label} color={cfg.color} size="small"
                                         sx={{fontWeight: 800, borderRadius: "6px", height: 24}}/>;
                        }}
                        sx={{"& .MuiSelect-select": {py: 0, display: 'flex'}}}
                    >
                        <MenuItem value="PLANNED">ОЖИДАНИЕ</MenuItem>
                        <MenuItem value="IN_PROGRESS">В ПУТИ</MenuItem>
                        <MenuItem value="COMPLETED">ЗАВЕРШЕН</MenuItem>
                        <MenuItem value="CANCELLED">ОТМЕНЕН</MenuItem>
                    </Select>
                </Stack>

                <Box sx={{mb: 1.5}}>
                    <Typography variant="body1" fontWeight="900" sx={{letterSpacing: "-0.02em", lineHeight: 1.2}}>
                        {trip.departure_location} → {trip.arrival_location}
                    </Typography>
                    {trip.stops && trip.stops.length > 0 && (
                        <Typography variant="caption"
                                    sx={{display: 'block', mt: 0.5, color: COLORS.TEXT_SECONDARY, fontWeight: 700}}>
                            📍 {[...trip.stops].sort((a, b) => a.stop_order - b.stop_order).map(s => s.location).join(' • ')}
                        </Typography>
                    )}
                </Box>

                <Divider sx={{my: 1.5, opacity: 0.5}}/>

                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption"
                                    sx={{color: COLORS.TEXT_SECONDARY, fontWeight: 700}}>МЕСТ:</Typography>
                        <InputBase
                            type="number" defaultValue={trip.passenger_count}
                            onBlur={(e) => handleUpdate(trip.id, {passenger_count: Number(e.target.value)})}
                            inputProps={{style: {padding: 0, fontWeight: 900, width: '40px', textAlign: 'center'}}}
                            sx={{bgcolor: COLORS.PAGE_BG, borderRadius: '6px', px: 1, py: 0.5}}
                        />
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption"
                                    sx={{color: COLORS.TEXT_SECONDARY, fontWeight: 700}}>ПРИЦЕП:</Typography>
                        <Checkbox
                            size="small" checked={Boolean(trip.has_trailer)}
                            onChange={(e) => handleUpdate(trip.id, {has_trailer: e.target.checked})}
                            sx={{p: 0}}
                        />
                    </Stack>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="caption" sx={{
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 700,
                            display: 'block'
                        }}>КЛИЕНТ</Typography>
                        <Typography fontWeight="800" fontSize="0.85rem">
                            {isContractTrip ? ((trip as any).scheduled_trip?.client_name?.toUpperCase() || "ПО КОНТРАКТУ") : (trip.customer?.first_name?.toUpperCase() || "КЛИЕНТ НЕ УКАЗАН")}
                        </Typography>
                        {!isContractTrip && (
                            <Typography color="primary" fontWeight="700"
                                        fontSize="0.75rem">{trip.customer?.phone || "НЕТ НОМЕРА"}</Typography>
                        )}
                    </Box>

                    <Box sx={{textAlign: 'right'}}>
                        <Typography variant="caption" sx={{
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 700,
                            display: 'block'
                        }}>ОПЛАТА</Typography>
                        {isContractTrip ? (
                            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                                <Typography fontWeight="900"
                                            sx={{color: COLORS.SUCCESS_GREEN}}>{trip.total_amount} ₽</Typography>
                                <Chip label="ТЕНДЕР" size="small" sx={{
                                    bgcolor: alpha(COLORS.SUCCESS_GREEN, 0.1), color: COLORS.SUCCESS_GREEN,
                                    fontWeight: 900, fontSize: '0.6rem', height: 20, borderRadius: '4px'
                                }}/>
                            </Stack>
                        ) : (
                            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                                <InputBase
                                    type="number" defaultValue={trip.paid_amount || 0}
                                    onBlur={(e) => handleUpdate(trip.id, {paid_amount: Number(e.target.value)})}
                                    inputProps={{
                                        style: {
                                            textAlign: 'right',
                                            padding: 0,
                                            fontWeight: 900,
                                            color: isFullyPaid ? COLORS.SUCCESS_GREEN : "#FF3B30",
                                            width: '50px'
                                        }
                                    }}
                                />
                                <Typography fontWeight="900"
                                            color={isFullyPaid ? COLORS.SUCCESS_GREEN : "#FF3B30"}>/</Typography>
                                <InputBase
                                    type="number" defaultValue={trip.total_amount || 0}
                                    onBlur={(e) => handleUpdate(trip.id, {total_amount: Number(e.target.value)})}
                                    inputProps={{style: {padding: 0, fontWeight: 900, width: '50px'}}}
                                />
                                <Typography fontWeight="900">₽</Typography>
                            </Stack>
                        )}
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} mt={2}>
                    <Button
                        fullWidth size="small" startIcon={<DirectionsCarIcon/>}
                        {...getAssignButtonProps(isVehicleAssigned)}
                        onClick={() => setAssignModal({
                            open: true,
                            tripId: trip.id,
                            currentVehicle: vehicleObj || null
                        })}
                        disabled={trip.status === 'CANCELLED'}
                    >
                        {vehicleDisplay}
                    </Button>
                    <Button
                        fullWidth
                        size="small"
                        startIcon={<PersonIcon/>}
                        {...getAssignButtonProps(isDriverAssigned)}
                        onClick={() => setAssignDriverModal({
                            open: true,
                            tripId: trip.id,
                            currentDriver: driverObj || null
                        })}
                        disabled={trip.status === 'CANCELLED'}
                    >
                        {driverDisplay}
                    </Button>
                    <IconButton size="small" sx={{bgcolor: COLORS.PAGE_BG, borderRadius: "10px"}}
                                onClick={() => navigate(`/dashboard/bookings/${trip.booking_id}`)}>
                        <OpenInNewIcon sx={{fontSize: 18}}/>
                    </IconButton>
                </Stack>
            </Paper>
        );
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== '' && v !== undefined);

    const handleApplyFilters = () => {
        loadData(showCancelled, buildApiFilters());
    };

    const handleResetFilters = () => {
        const empty = {date_from: null, date_to: null, status: '', has_trailer: '', is_regular: '', payment_status: '', passenger_count: '', paid_amount: ''};
        setFilters(empty);
        setSearch('');
        loadData(showCancelled, {});
    };

    if (loading && trips.length === 0) return <Box
        sx={{display: 'flex', justifyContent: 'center', mt: 10}}><CircularProgress/></Box>;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <Box sx={{p: isMobile ? 2 : 4, bgcolor: COLORS.PAGE_BG, minHeight: "100vh"}}>
            <Stack direction={{xs: "column", sm: "row"}} justifyContent="space-between" alignItems="center"
                   mb={2}>
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="900"
                            sx={{letterSpacing: "-0.04em", color: "#1D1D1F", mb: {xs: 2, sm: 0}}}>
                    Журнал рейсов
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={showCancelled}
                            onChange={(e) => setShowCancelled(e.target.checked)}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {color: COLORS.ACCENT_YELLOW},
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: COLORS.ACCENT_YELLOW}
                            }}
                        />
                    }
                    label={<Typography variant="body2" fontWeight="bold">Показывать отмененные</Typography>}
                />
            </Stack>

            {/* Search + Filter bar */}
            <Stack direction="row" spacing={1} mb={2} alignItems="center">
                <TextField
                    size="small" placeholder="Поиск по маршруту, клиенту..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{flex: 1, bgcolor: '#fff', borderRadius: '12px', '& .MuiOutlinedInput-root': {borderRadius: '12px'}}}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{color: COLORS.TEXT_SECONDARY, fontSize: 20}}/></InputAdornment>,
                        endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><ClearIcon sx={{fontSize: 16}}/></IconButton></InputAdornment> : null
                    }}
                />
                <Button
                    variant={showFilters || hasActiveFilters ? 'contained' : 'outlined'}
                    startIcon={<FilterListIcon/>}
                    onClick={() => setShowFilters(p => !p)}
                    sx={{
                        borderRadius: '12px', fontWeight: 800, whiteSpace: 'nowrap',
                        bgcolor: showFilters || hasActiveFilters ? COLORS.ACCENT_YELLOW : 'transparent',
                        color: '#000', borderColor: COLORS.ACCENT_YELLOW,
                        boxShadow: 'none',
                        '&:hover': {bgcolor: alpha(COLORS.ACCENT_YELLOW, 0.8), boxShadow: 'none'}
                    }}
                >
                    Фильтры{hasActiveFilters ? ' •' : ''}
                </Button>
            </Stack>

            <Collapse in={showFilters}>
                <Paper elevation={0} sx={{p: 2, mb: 2, borderRadius: '16px', border: `1px solid ${COLORS.BORDER}`, bgcolor: '#fff'}}>
                    <Stack spacing={2}>
                        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                            <DatePicker
                                label="Дата от" value={filters.date_from}
                                onChange={(v) => setFilters(p => ({...p, date_from: v}))}
                                slotProps={{textField: {size: 'small', sx: {flex: 1}}}}
                            />
                            <DatePicker
                                label="Дата до" value={filters.date_to}
                                onChange={(v) => setFilters(p => ({...p, date_to: v}))}
                                slotProps={{textField: {size: 'small', sx: {flex: 1}}}}
                            />
                            <TextField select label="Статус" size="small" value={filters.status}
                                onChange={(e) => setFilters(p => ({...p, status: e.target.value}))}
                                sx={{flex: 1}}>
                                <MenuItem value="">Все</MenuItem>
                                <MenuItem value="PLANNED">Ожидание</MenuItem>
                                <MenuItem value="IN_PROGRESS">В пути</MenuItem>
                                <MenuItem value="COMPLETED">Завершен</MenuItem>
                                <MenuItem value="CANCELLED">Отменен</MenuItem>
                            </TextField>
                            <TextField select label="Статус оплаты" size="small" value={filters.payment_status}
                                onChange={(e) => setFilters(p => ({...p, payment_status: e.target.value}))}
                                sx={{flex: 1}}>
                                <MenuItem value="">Все</MenuItem>
                                <MenuItem value="PAID">Оплачено</MenuItem>
                                <MenuItem value="PENDING">Ожидает оплаты</MenuItem>
                            </TextField>
                        </Stack>
                        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center">
                            <TextField select label="Прицеп" size="small" value={filters.has_trailer}
                                onChange={(e) => setFilters(p => ({...p, has_trailer: e.target.value}))}
                                sx={{flex: 1}}>
                                <MenuItem value="">Любой</MenuItem>
                                <MenuItem value="true">Есть</MenuItem>
                                <MenuItem value="false">Нет</MenuItem>
                            </TextField>
                            <TextField select label="Регулярный" size="small" value={filters.is_regular}
                                onChange={(e) => setFilters(p => ({...p, is_regular: e.target.value}))}
                                sx={{flex: 1}}>
                                <MenuItem value="">Любой</MenuItem>
                                <MenuItem value="true">Да</MenuItem>
                                <MenuItem value="false">Нет</MenuItem>
                            </TextField>
                            <TextField label="Кол-во мест" size="small" type="number" value={filters.passenger_count}
                                onChange={(e) => setFilters(p => ({...p, passenger_count: e.target.value}))}
                                sx={{flex: 1}}/>
                            <TextField label="Оплачено (от)" size="small" type="number" value={filters.paid_amount}
                                onChange={(e) => setFilters(p => ({...p, paid_amount: e.target.value}))}
                                sx={{flex: 1}}/>
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" onClick={handleApplyFilters}
                                    sx={{borderRadius: '10px', fontWeight: 800, bgcolor: COLORS.ACCENT_YELLOW, color: '#000', boxShadow: 'none', '&:hover': {bgcolor: alpha(COLORS.ACCENT_YELLOW, 0.8), boxShadow: 'none'}}}>
                                    Применить
                                </Button>
                                {hasActiveFilters && (
                                    <Button variant="outlined" onClick={handleResetFilters}
                                        sx={{borderRadius: '10px', fontWeight: 800, boxShadow: 'none'}}>
                                        Сбросить
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>
            </Collapse>

            {Object.keys(groupedTrips).length === 0 && !loading && (
                <Typography color="text.secondary" textAlign="center" mt={5}>
                    Нет рейсов
                </Typography>
            )}

            {Object.entries(groupedTrips).sort((a, b) => dayjs(b[0]).diff(dayjs(a[0]))).map(([date, dayTrips]) => (
                <Accordion key={date} defaultExpanded elevation={0}
                           sx={{mb: 3, bgcolor: "transparent", "&:before": {display: "none"}}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        sx={{
                            bgcolor: COLORS.ACCENT_YELLOW, borderRadius: "16px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)", mb: 1.5,
                            minHeight: 48, "&.Mui-expanded": {minHeight: 48}
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="900" color="black">
                            {dayjs(date).locale("ru").format(isMobile ? "DD.MM, dddd" : "DD MMMM, dddd").toUpperCase()}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{p: 0}}>
                        {isMobile ? (
                            <Box sx={{px: 0.5}}>
                                {dayTrips.sort((a, b) => a.departure_time.localeCompare(b.departure_time)).map(trip => (
                                    <MobileTripCard key={trip.id} trip={trip}/>
                                ))}
                            </Box>
                        ) : (
                            <TableContainer component={Paper} sx={{
                                borderRadius: "20px", overflow: "hidden",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.04)", border: `1px solid ${COLORS.BORDER}`
                            }}>
                                <Table sx={{tableLayout: "fixed", minWidth: 1100, borderCollapse: 'collapse'}}>
                                    <TableHead sx={{bgcolor: "#FBFBFC"}}>
                                        <TableRow sx={{
                                            "& th": {
                                                fontWeight: 800,
                                                fontSize: "0.7rem",
                                                color: "#86868B",
                                                textTransform: 'uppercase'
                                            }
                                        }}>
                                            <TableCell sx={{...cellSx, width: COLS.TIME}}>Время</TableCell>
                                            <TableCell sx={{...cellSx, width: COLS.ROUTE}}>Маршрут</TableCell>
                                            <TableCell sx={{...cellSx, width: COLS.CLIENT}}>Клиент</TableCell>
                                            <TableCell
                                                sx={{...cellSx, width: COLS.PASS, textAlign: 'center'}}>Мест</TableCell>
                                            <TableCell
                                                sx={{...cellSx, width: COLS.TRAIL, textAlign: 'center'}}>Пр</TableCell>
                                            <TableCell sx={{...cellSx, width: COLS.AUTO}}>Транспорт</TableCell>
                                            <TableCell sx={{...cellSx, width: COLS.DRIVER}}>Водитель</TableCell>
                                            <TableCell sx={{
                                                ...cellSx,
                                                width: COLS.PAID,
                                                textAlign: 'right'
                                            }}>Оплата</TableCell>
                                            <TableCell sx={{
                                                ...cellSx,
                                                width: COLS.TOTAL,
                                                textAlign: 'right'
                                            }}>Итого</TableCell>
                                            <TableCell sx={{
                                                ...cellSx,
                                                width: COLS.STATUS,
                                                textAlign: 'center',
                                                borderRight: 'none'
                                            }}>Статус</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {dayTrips.sort((a, b) => a.departure_time.localeCompare(b.departure_time)).map((trip, idx) => {
                                            const rowBg = idx % 2 === 0 ? COLORS.PALE_YELLOW : "#FFFFFF";
                                            const isFullyPaid = Number(trip.paid_amount) >= Number(trip.total_amount);
                                            const isContractTrip = Boolean((trip as any).scheduled_trip_id);

                                            const vehiclesList = Array.isArray(vehicles) ? vehicles : ((vehicles as any).items || []);
                                            const vehicleObj = (trip as any).vehicle || vehiclesList.find((v: any) => v.id === (trip as any).vehicle_id);
                                            const isVehicleAssigned = !!vehicleObj;
                                            const vehicleDisplay = vehicleObj ? (vehicleObj.alias || vehicleObj.license_plate) : 'Выбрать авто';

                                            const driversList = Array.isArray(drivers) ? drivers : ((drivers as any).items || []);
                                            const driverObj = (trip as any).driver || driversList.find((d: any) => d.id === (trip as any).driver_id);
                                            const isDriverAssigned = !!driverObj;
                                            const driverDisplay = driverObj ? driverObj.call_sign : 'Выбрать вод.';

                                            return (
                                                <TableRow key={trip.id} sx={{
                                                    bgcolor: rowBg,
                                                    opacity: trip.status === 'CANCELLED' ? 0.5 : 1,
                                                    "&:hover": {bgcolor: alpha(COLORS.ACCENT_YELLOW, 0.05)}
                                                }}>
                                                    <TableCell sx={cellSx}>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <AccessTimeIcon
                                                                sx={{fontSize: 14, color: COLORS.ACCENT_YELLOW}}/>
                                                            <Typography variant="body2" fontWeight="900"
                                                                        sx={{textDecoration: trip.status === 'CANCELLED' ? 'line-through' : 'none'}}>
                                                                {trip.departure_time.slice(0, 5)}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={cellSx}>
                                                        <Typography variant="body2" fontWeight="900" color="#1D1D1F">
                                                            {trip.departure_location} → {trip.arrival_location}
                                                        </Typography>
                                                        {trip.stops && trip.stops.length > 0 && (
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '0.65rem',
                                                                display: 'block',
                                                                mt: 0.2,
                                                                color: COLORS.TEXT_SECONDARY,
                                                                fontWeight: 700
                                                            }}>
                                                                📍 {[...trip.stops].sort((a, b) => a.stop_order - b.stop_order).map(s => s.location).join(' • ')}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={cellSx}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Box sx={{minWidth: 0}}>
                                                                <Typography variant="caption" fontWeight="900"
                                                                            color="black" display="block">
                                                                    {isContractTrip ? ((trip as any).scheduled_trip?.client_name?.toUpperCase() || "ТЕНДЕР") : (trip.customer?.first_name?.toUpperCase() || "КЛИЕНТ НЕ УКАЗАН")}
                                                                </Typography>
                                                                {!isContractTrip && (
                                                                    <Typography variant="caption" color="primary" sx={{
                                                                        fontWeight: 800,
                                                                        fontSize: '0.65rem'
                                                                    }}>
                                                                        {trip.customer?.phone || "НЕТ НОМЕРА"}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            {!isContractTrip && (
                                                                <IconButton size="small"
                                                                            onClick={() => navigate(`/dashboard/bookings/${trip.booking_id}`)}>
                                                                    <OpenInNewIcon
                                                                        sx={{fontSize: 14, color: "#86868B"}}/>
                                                                </IconButton>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{...cellSx, textAlign: 'center'}}>
                                                        <TextField type="number" variant="standard"
                                                                   defaultValue={trip.passenger_count}
                                                                   onBlur={(e) => handleUpdate(trip.id, {passenger_count: Number(e.target.value)})}
                                                                   sx={inputSx}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{...cellSx, textAlign: 'center'}}>
                                                        <Checkbox size="small" checked={Boolean(trip.has_trailer)}
                                                                  onChange={(e) => handleUpdate(trip.id, {has_trailer: e.target.checked})}
                                                                  sx={{borderRadius: "4px"}}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={cellSx}>
                                                        <Button fullWidth {...getAssignButtonProps(isVehicleAssigned)}
                                                                onClick={() => setAssignModal({
                                                                    open: true,
                                                                    tripId: trip.id,
                                                                    currentVehicle: vehicleObj || null
                                                                })}
                                                                disabled={trip.status === 'CANCELLED'}
                                                        >
                                                            {vehicleDisplay}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell sx={cellSx}>
                                                        <Button
                                                            fullWidth
                                                            {...getAssignButtonProps(isDriverAssigned)}
                                                            onClick={() => setAssignDriverModal({
                                                                open: true,
                                                                tripId: trip.id,
                                                                currentDriver: driverObj || null
                                                            })}
                                                            disabled={trip.status === 'CANCELLED'}
                                                        >
                                                            {driverDisplay}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell sx={cellSx}>
                                                        {isContractTrip ? (
                                                            <Box sx={{textAlign: 'right'}}>
                                                                <Chip label={`${trip.total_amount} ₽`} size="small"
                                                                      sx={{
                                                                          fontWeight: 900,
                                                                          borderRadius: "6px",
                                                                          width: "100%",
                                                                          bgcolor: alpha(COLORS.SUCCESS_GREEN, 0.1),
                                                                          color: COLORS.SUCCESS_GREEN,
                                                                          border: `1px solid ${alpha(COLORS.SUCCESS_GREEN, 0.2)}`
                                                                      }}
                                                                />
                                                                <Typography variant="caption" sx={{
                                                                    fontSize: '0.55rem',
                                                                    fontWeight: 800,
                                                                    color: COLORS.SUCCESS_GREEN,
                                                                    display: 'block',
                                                                    mt: 0.5,
                                                                    textAlign: 'center'
                                                                }}>КОНТРАКТ</Typography>
                                                            </Box>
                                                        ) : (
                                                            <TextField variant="standard"
                                                                       defaultValue={trip.paid_amount || 0}
                                                                       onBlur={(e) => handleUpdate(trip.id, {paid_amount: Number(e.target.value)})}
                                                                       sx={{
                                                                           ...inputSx,
                                                                           "& .MuiInputBase-input": {
                                                                               textAlign: 'right',
                                                                               color: isFullyPaid ? COLORS.SUCCESS_GREEN : "#FF3B30"
                                                                           }
                                                                       }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={cellSx}>
                                                        <Typography fontWeight="900" textAlign="right"
                                                                    sx={{color: COLORS.TEXT_MAIN, pr: 1}}>
                                                            {trip.total_amount} ₽
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{...cellSx, borderRight: 'none'}}>
                                                        <Select value={trip.status} size="small" fullWidth
                                                                variant="standard" disableUnderline
                                                                onChange={(e) => handleUpdate(trip.id, {status: e.target.value})}
                                                                renderValue={(v) => {
                                                                    const cfg = getStatusConfig(v as string);
                                                                    return <Chip label={cfg.label} color={cfg.color}
                                                                                 size="small" sx={{
                                                                        fontWeight: 900,
                                                                        fontSize: "0.6rem",
                                                                        borderRadius: "8px",
                                                                        width: "100%",
                                                                        height: 22
                                                                    }}/>;
                                                                }}
                                                                sx={{"& .MuiSelect-select": {py: 0.5, display: 'flex'}}}
                                                        >
                                                            <MenuItem value="PLANNED">ОЖИДАНИЕ</MenuItem>
                                                            <MenuItem value="IN_PROGRESS">В ПУТИ</MenuItem>
                                                            <MenuItem value="COMPLETED">ЗАВЕРШЕН</MenuItem>
                                                            <MenuItem value="CANCELLED">ОТМЕНЕН</MenuItem>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            <AssignVehicleModal
                open={assignModal.open}
                onClose={() => setAssignModal({open: false, tripId: null, currentVehicle: null})}
                vehicles={vehicles}
                allTrips={trips}
                trip={trips.find(t => t.id === assignModal.tripId) || null}
                onAssign={handleAssignVehicle}
                isLoading={loading}
            />

            <AssignDriverModal
                open={assignDriverModal.open}
                onClose={() => setAssignDriverModal({open: false, tripId: null, currentDriver: null})}
                drivers={drivers}
                onAssign={handleAssignDriver}
            />
        </Box>
        </LocalizationProvider>
    );
};