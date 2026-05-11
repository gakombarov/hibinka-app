import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControlLabel,
    Grid,
    Stack,
    Switch,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {scheduledTripsApi} from "../api/scheduledTrips";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const hideSecondsSx = {
    "& .MuiInputBase-input::-webkit-datetime-edit-second-field": {
        display: "none",
    },
    "& .MuiInputBase-input::-webkit-datetime-edit-millisecond-field": {
        display: "none",
    },
    "& .MuiInputBase-input::-webkit-datetime-edit-ampm-field": {
        display: "none",
    },
};

export const ScheduledTripFormPage = () => {
    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        route_number: "",
        departure_location: "",
        destination: "",
        departure_time: "",
        total_contract_value: "",
        contract_start_date: "",
        contract_end_date: "",
        is_active: true,
        show_on_landing: false,
        notes: ""
    });
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [stops, setStops] = useState<any[]>([]);

    useEffect(() => {
        if (isEdit && id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (tripId: string) => {
        setLoading(true);
        try {
            const data = await scheduledTripsApi.getById(tripId);

            const toHHMM = (t: string | null | undefined) => {
                if (!t) return "";
                return t.substring(0, 5);
            };

            setFormData({
                route_number: data.route_number.toString(),
                departure_location: data.departure_location,
                destination: data.destination,
                departure_time: toHHMM(data.departure_time),
                total_contract_value: data.total_contract_value?.toString() || "",
                contract_start_date: data.contract_start_date || "",
                contract_end_date: data.contract_end_date || "",
                is_active: data.is_active,
                show_on_landing: data.show_on_landing,
                notes: data.notes || ""
            });
            setSelectedDays(data.days_of_week.split(", "));

            setStops((data.stops || []).map((s: any) => ({
                ...s,
                stop_time: toHHMM(s.stop_time)
            })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);

        const toFullTime = (t: string) => {
            if (!t || t === "") return "00:00:00";
            return t.length === 5 ? `${t}:00` : t;
        };

        const payload = {
            ...formData,
            route_number: parseInt(formData.route_number) || 0,
            total_contract_value: formData.total_contract_value ? parseInt(formData.total_contract_value) : undefined,
            days_of_week: selectedDays.join(", "),
            departure_time: toFullTime(formData.departure_time),
            stops: stops.map((s, i) => ({
                ...s,
                stop_order: i + 1,
                stop_time: toFullTime(s.stop_time)
            })),
            price: 0
        };

        try {
            if (isEdit && id) {
                await scheduledTripsApi.update(id, payload);
            } else {
                await scheduledTripsApi.create(payload);
            }
            navigate("/dashboard/schedule");
        } catch (e) {
            console.error(e);
            alert("Ошибка сохранения. Проверьте консоль.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{p: {xs: 2, sm: 4}, maxWidth: 900, mx: "auto"}}>
            <Button startIcon={<ArrowBackIcon/>} onClick={() => navigate(-1)} sx={{mb: 2}}>Назад</Button>

            <Typography variant="h4" fontWeight="bold" mb={4}>
                {isEdit ? "Редактирование" : "Новое расписание"}
            </Typography>

            <Card sx={{mb: 3}}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="№ Маршрута" value={formData.route_number}
                                       onChange={e => setFormData({...formData, route_number: e.target.value})}/>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Время старта"
                                type="time"
                                value={formData.departure_time}
                                onChange={e => setFormData({...formData, departure_time: e.target.value})}
                                InputLabelProps={{shrink: true}}
                                inputProps={{step: 300}}
                                sx={hideSecondsSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Откуда" value={formData.departure_location}
                                       onChange={e => setFormData({...formData, departure_location: e.target.value})}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Куда" value={formData.destination}
                                       onChange={e => setFormData({...formData, destination: e.target.value})}/>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Typography variant="h6" mb={2}>Периодичность и Контракт</Typography>
            <Card sx={{mb: 3}}>
                <CardContent>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
                        {DAYS.map(day => (
                            <Button
                                key={day}
                                variant={selectedDays.includes(day) ? "contained" : "outlined"}
                                onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                                sx={{mb: 1}}
                            >
                                {day}
                            </Button>
                        ))}
                    </Stack>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Сумма контракта" type="number"
                                       value={formData.total_contract_value}
                                       onChange={e => setFormData({
                                           ...formData,
                                           total_contract_value: e.target.value
                                       })}/>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <TextField fullWidth label="Дата начала" type="date" value={formData.contract_start_date}
                                       onChange={e => setFormData({...formData, contract_start_date: e.target.value})}
                                       InputLabelProps={{shrink: true}}/>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <TextField fullWidth label="Дата конца" type="date" value={formData.contract_end_date}
                                       onChange={e => setFormData({...formData, contract_end_date: e.target.value})}
                                       InputLabelProps={{shrink: true}}/>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Typography variant="h6" mb={2}>Остановки</Typography>
            <Card sx={{mb: 3}}>
                <CardContent>
                    {stops.map((stop, index) => (
                        <Stack key={index} direction={{xs: "column", sm: "row"}} spacing={2} mb={2} alignItems="center">
                            <TextField size="small" label="Локация" fullWidth value={stop.location}
                                       onChange={e => {
                                           const newStops = [...stops];
                                           newStops[index].location = e.target.value;
                                           setStops(newStops);
                                       }}/>
                            <TextField size="small" type="time" label="Время" value={stop.stop_time}
                                       onChange={e => {
                                           const newStops = [...stops];
                                           newStops[index].stop_time = e.target.value;
                                           setStops(newStops);
                                       }}
                                       InputLabelProps={{shrink: true}}
                                       inputProps={{step: 300}}
                                       sx={{...hideSecondsSx, minWidth: 120}}
                            />
                            <IconButton color="error" onClick={() => setStops(stops.filter((_, i) => i !== index))}>
                                <DeleteIcon/>
                            </IconButton>
                        </Stack>
                    ))}
                    <Button startIcon={<AddIcon/>} onClick={() => setStops([...stops, {location: "", stop_time: ""}])}>
                        Добавить остановку
                    </Button>
                </CardContent>
            </Card>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4}>
                <Stack direction="row" spacing={2}>
                    <FormControlLabel control={<Switch checked={formData.is_active} onChange={e => setFormData({
                        ...formData,
                        is_active: e.target.checked
                    })}/>} label="Активно"/>
                    <FormControlLabel control={<Switch checked={formData.show_on_landing} onChange={e => setFormData({
                        ...formData,
                        show_on_landing: e.target.checked
                    })}/>} label="Лендинг"/>
                </Stack>
                <Button variant="contained" size="large" onClick={handleSave} disabled={loading}>
                    Сохранить
                </Button>
            </Stack>
        </Box>
    );
};