import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    FormControlLabel,
    IconButton,
    Stack,
    Switch,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BusinessIcon from '@mui/icons-material/Business';
import {AppDispatch, RootState} from "../store/store";
import {fetchAdminSchedules, triggerGeneration} from "../store/scheduledTripsSlice";
import {scheduledTripsApi} from "../api/scheduledTrips";

export const ScheduleAdminPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const theme = useTheme();

    // Определяем, смотрит ли пользователь с мобилки (экраны меньше "sm" - 600px)
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const {items, loading, isGenerating} = useSelector((state: RootState) => state.scheduledTrips);

    useEffect(() => {
        dispatch(fetchAdminSchedules());
    }, [dispatch]);

    const handleGenerate = async () => {
        await dispatch(triggerGeneration()).unwrap();
        alert("Генерация запущена! Рейсы появятся в журнале в фоновом режиме.");
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        await scheduledTripsApi.toggleActive(id, !currentStatus);
        dispatch(fetchAdminSchedules());
    };

    return (
        <Box sx={{p: {xs: 2, sm: 4}, maxWidth: 1200, mx: "auto"}}>

            {/* АДАПТИВНАЯ ШАПКА */}
            <Stack
                direction={{xs: "column", md: "row"}}
                justifyContent="space-between"
                alignItems={{xs: "stretch", md: "center"}}
                spacing={2}
                mb={4}
            >
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                    Тендеры и Расписания
                </Typography>

                {/* Кнопки на мобилке занимают 100% ширины и идут друг под другом */}
                <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                    <Button
                        variant="contained"
                        size={isMobile ? "large" : "medium"}
                        startIcon={<AddIcon/>}
                        onClick={() => navigate("new")}
                        fullWidth={isMobile}
                    >
                        Добавить
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size={isMobile ? "large" : "medium"}
                        startIcon={<AutorenewIcon/>}
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        fullWidth={isMobile}
                    >
                        {isGenerating ? "Синхронизация..." : "Синхронизировать рейсы"}
                    </Button>
                </Stack>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress/>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {items.map(trip => (
                        <Card
                            key={trip.id}
                            sx={{
                                p: {xs: 2, sm: 3},
                                display: 'flex',
                                flexDirection: {xs: 'column', md: 'row'}, // На мобилке всё в колонку
                                gap: 2,
                                justifyContent: 'space-between',
                                alignItems: {xs: 'flex-start', md: 'center'}
                            }}
                        >
                            <Box sx={{flex: 1, cursor: 'pointer', width: '100%'}}
                                 onClick={() => navigate(`${trip.id}`)}>
                                <Typography variant="h6" color="primary" fontWeight="bold"
                                            sx={{lineHeight: 1.2, mb: 1}}>
                                    №{trip.route_number}: {trip.departure_location} — {trip.destination}
                                </Typography>

                                {/* ВЫВОД ЗАКАЗЧИКА */}
                                {(trip as any).client_name && (
                                    <Chip
                                        icon={<BusinessIcon fontSize="small"/>}
                                        label={(trip as any).client_name}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{mb: 1, fontWeight: "bold"}}
                                    />
                                )}

                                <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                    <b>Дни:</b> {trip.days_of_week} | <b>Старт:</b> {trip.departure_time.substring(0, 5)} | <b>{trip.price} ₽</b>
                                </Typography>

                                {/* Остановки (с flexWrap, чтобы не вылезали за края на мобилках) */}
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {trip.stops.map(stop => (
                                        <Chip key={stop.id} label={stop.location} size="small"
                                              sx={{bgcolor: "#f5f5f7"}}/>
                                    ))}
                                </Stack>
                            </Box>

                            {/* Элементы управления (свитчи и кнопка ред.) */}
                            <Stack
                                direction={{xs: "row", md: "row"}}
                                spacing={{xs: 1, sm: 3}}
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                    width: {xs: '100%', md: 'auto'},
                                    pt: {xs: 2, md: 0},
                                    borderTop: {xs: '1px solid #f0f0f0', md: 'none'}
                                }}
                            >
                                <Stack direction="column" spacing={0}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size={isMobile ? "small" : "medium"}
                                                checked={trip.show_on_landing}
                                                onChange={async () => {
                                                    await scheduledTripsApi.update(trip.id, {show_on_landing: !trip.show_on_landing});
                                                    dispatch(fetchAdminSchedules());
                                                }}
                                            />
                                        }
                                        label={<Typography variant="body2">Лендинг</Typography>}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size={isMobile ? "small" : "medium"}
                                                checked={trip.is_active}
                                                onChange={() => handleToggleActive(trip.id, trip.is_active)}
                                                color="success"
                                            />
                                        }
                                        label={<Typography variant="body2">Активен</Typography>}
                                    />
                                </Stack>

                                <IconButton
                                    onClick={() => navigate(`${trip.id}`)}
                                    color="primary"
                                    sx={{bgcolor: "#f0f4ff", borderRadius: "12px"}}
                                >
                                    <EditIcon/>
                                </IconButton>
                            </Stack>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
};