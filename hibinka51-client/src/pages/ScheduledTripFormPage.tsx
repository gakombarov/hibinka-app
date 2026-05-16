import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Stack,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {TimePicker} from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import {scheduledTripsApi} from "../api/scheduledTrips";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const ScheduledTripFormPage = () => {
    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const [formData, setFormData] = useState({
        route_number: "",
        client_name: "",
        departure_location: "",
        destination: "",
        total_contract_value: "",
        contract_start_date: "",
        contract_end_date: "",
        is_active: true,
        show_on_landing: false,
        notes: ""
    });

    const [cycles, setCycles] = useState([
        {days: [] as string[], forwardTime: "", returnTime: ""}
    ]);

    const [stops, setStops] = useState<any[]>([]);

    useEffect(() => {
        if (isEdit && id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (tripId: string) => {
        try {
            const data = await scheduledTripsApi.getById(tripId);

            const toHHMM = (t: string | null | undefined) => {
                if (!t) return "";
                return t.substring(0, 5);
            };

            setFormData({
                route_number: data.route_number.toString(),
                client_name: data.client_name || "",
                departure_location: data.departure_location,
                destination: data.destination,
                total_contract_value: data.total_contract_value?.toString() || "",
                contract_start_date: data.contract_start_date || "",
                contract_end_date: data.contract_end_date || "",
                is_active: data.is_active,
                show_on_landing: data.show_on_landing,
                notes: data.notes || ""
            });

            if (data.cycles && data.cycles.length > 0) {
                setCycles(data.cycles.map((c: any) => ({
                    days: c.days_of_week.split(", "),
                    forwardTime: toHHMM(c.departure_time),
                    returnTime: toHHMM(c.return_time)
                })));
            }

            if (data.stops) {
                setStops(data.stops.map((s: any) => ({
                    ...s,
                    stop_time: toHHMM(s.stop_time)
                })));
            }
        } catch (e) {
            console.error(e);
            alert("Ошибка загрузки данных");
        } finally {
            setFetching(false);
        }
    };

    const toggleDayInCycle = (cycleIndex: number, day: string) => {
        const newCycles = [...cycles];
        const days = newCycles[cycleIndex].days;
        if (days.includes(day)) {
            newCycles[cycleIndex].days = days.filter(d => d !== day);
        } else {
            newCycles[cycleIndex].days.push(day);
        }
        setCycles(newCycles);
    };

    const updateCycleTime = (index: number, field: 'forwardTime' | 'returnTime', val: string) => {
        const newCycles = [...cycles];
        newCycles[index][field] = val;
        setCycles(newCycles);
    };

    const handleSave = async () => {
        if (!formData.contract_start_date || !formData.contract_end_date) {
            return alert("Укажите даты контракта!");
        }
        if (cycles.length === 0 || cycles[0].days.length === 0) {
            return alert("Добавьте хотя бы один рейс и выберите дни недели!");
        }

        setLoading(true);

        const payload = {
            ...formData,
            route_number: parseInt(formData.route_number) || 0,
            total_contract_value: parseInt(formData.total_contract_value) || 0,
            cycles: cycles.map(c => ({
                days_of_week: c.days.join(", "),
                departure_time: c.forwardTime ? `${c.forwardTime}:00` : "00:00:00",
                return_time: c.returnTime ? `${c.returnTime}:00` : "00:00:00",
            })),
            stops: stops.map((s, i) => ({
                ...s,
                stop_order: i + 1,
                stop_time: s.stop_time ? `${s.stop_time}:00` : null
            }))
        };

        try {
            if (isEdit && id) {
                await scheduledTripsApi.update(id, payload);
            } else {
                await scheduledTripsApi.create(payload);
            }
            navigate(-1);
        } catch (e) {
            console.error(e);
            alert("Ошибка сохранения. Проверьте консоль.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Box sx={{p: 4, textAlign: 'center'}}><CircularProgress/></Box>;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
            <Box sx={{p: {xs: 2, sm: 4}, maxWidth: 900, mx: "auto"}}>
                <Button startIcon={<ArrowBackIcon/>} onClick={() => navigate(-1)} sx={{mb: 2}}>Назад</Button>

                <Typography variant="h4" fontWeight="bold" mb={4}>
                    {isEdit ? "Редактирование расписания" : "Новый контракт (Тендер)"}
                </Typography>

                <Card sx={{mb: 3}}>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth label="№ Маршрута" value={formData.route_number}
                                           onChange={e => setFormData({...formData, route_number: e.target.value})}/>
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField fullWidth label="Заказчик (Организация)" placeholder="ООО Ромашка"
                                           value={formData.client_name}
                                           onChange={e => setFormData({...formData, client_name: e.target.value})}/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Откуда (Старт)" value={formData.departure_location}
                                           onChange={e => setFormData({
                                               ...formData,
                                               departure_location: e.target.value
                                           })}/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Куда (Разворот)" value={formData.destination}
                                           onChange={e => setFormData({...formData, destination: e.target.value})}/>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Typography variant="h6" mb={2}>Бюджет и Сроки</Typography>
                <Card sx={{mb: 3}}>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Общая сумма контракта (₽)" type="number"
                                           value={formData.total_contract_value} onChange={e => setFormData({
                                    ...formData,
                                    total_contract_value: e.target.value
                                })}/>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <DatePicker
                                    label="Дата начала" format="DD.MM.YYYY"
                                    value={formData.contract_start_date ? dayjs(formData.contract_start_date) : null}
                                    onChange={(val) => setFormData({
                                        ...formData,
                                        contract_start_date: val ? val.format("YYYY-MM-DD") : ""
                                    })}
                                    slotProps={{textField: {fullWidth: true}}}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <DatePicker
                                    label="Дата конца" format="DD.MM.YYYY"
                                    value={formData.contract_end_date ? dayjs(formData.contract_end_date) : null}
                                    onChange={(val) => setFormData({
                                        ...formData,
                                        contract_end_date: val ? val.format("YYYY-MM-DD") : ""
                                    })}
                                    slotProps={{textField: {fullWidth: true}}}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Typography variant="h6" mb={2}>График рейсов (Циклы Туда-Обратно)</Typography>
                {cycles.map((cycle, index) => (
                    <Card key={index} variant="outlined" sx={{mb: 2, borderColor: "primary.main", borderWidth: 2}}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" mb={2}>
                                <Typography fontWeight="bold" color="primary">Цикл (Круговой рейс)
                                    #{index + 1}</Typography>
                                {cycles.length > 1 && (
                                    <IconButton size="small" color="error"
                                                onClick={() => setCycles(cycles.filter((_, i) => i !== index))}><DeleteIcon/></IconButton>
                                )}
                            </Stack>

                            <Typography variant="caption" color="text.secondary" mb={1} display="block">Дни
                                выполнения:</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
                                {DAYS.map(day => (
                                    <Chip
                                        key={day} label={day}
                                        onClick={() => toggleDayInCycle(index, day)}
                                        color={cycle.days.includes(day) ? "primary" : "default"}
                                        sx={{fontWeight: "bold"}}
                                    />
                                ))}
                            </Stack>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TimePicker
                                        label="Время выезда ТУДА" ampm={false} format="HH:mm"
                                        value={cycle.forwardTime ? dayjs(`2000-01-01T${cycle.forwardTime}`) : null}
                                        onChange={(val) => updateCycleTime(index, "forwardTime", val ? val.format("HH:mm") : "")}
                                        slotProps={{textField: {fullWidth: true}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TimePicker
                                        label="Время выезда ОБРАТНО" ampm={false} format="HH:mm"
                                        value={cycle.returnTime ? dayjs(`2000-01-01T${cycle.returnTime}`) : null}
                                        onChange={(val) => updateCycleTime(index, "returnTime", val ? val.format("HH:mm") : "")}
                                        slotProps={{textField: {fullWidth: true}}}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                ))}
                <Button startIcon={<AddIcon/>} variant="contained" color="secondary"
                        onClick={() => setCycles([...cycles, {days: [], forwardTime: "", returnTime: ""}])}>
                    Добавить еще один график (например, для выходных)
                </Button>

                <Typography variant="h6" mb={2} mt={4}>Остановки</Typography>
                <Card sx={{mb: 3}}>
                    <CardContent>
                        {stops.map((stop, index) => (
                            <Stack key={index} direction={{xs: "column", sm: "row"}} spacing={2} mb={2}
                                   alignItems="center">
                                <TextField size="small" label="Локация" fullWidth value={stop.location}
                                           onChange={e => {
                                               const newStops = [...stops];
                                               newStops[index].location = e.target.value;
                                               setStops(newStops);
                                           }}/>
                                <TimePicker
                                    label="Время (опц.)" ampm={false} format="HH:mm"
                                    value={stop.stop_time ? dayjs(`2000-01-01T${stop.stop_time}`) : null}
                                    onChange={(val) => {
                                        const newStops = [...stops];
                                        newStops[index].stop_time = val ? val.format("HH:mm") : "";
                                        setStops(newStops);
                                    }}
                                    slotProps={{textField: {size: "small", sx: {minWidth: 120}}}}
                                />
                                <IconButton color="error" onClick={() => setStops(stops.filter((_, i) => i !== index))}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Stack>
                        ))}
                        <Button startIcon={<AddIcon/>}
                                onClick={() => setStops([...stops, {location: "", stop_time: ""}])}>
                            Добавить остановку
                        </Button>
                    </CardContent>
                </Card>

                <Divider sx={{my: 4}}/>

                <Stack direction={{xs: "column", sm: "row"}} justifyContent="space-between" alignItems="center"
                       spacing={2}>
                    <Stack direction="row" spacing={3}>
                        <FormControlLabel control={<Switch checked={formData.show_on_landing}
                                                           onChange={e => setFormData({
                                                               ...formData,
                                                               show_on_landing: e.target.checked
                                                           })}/>} label="На лендинг"/>
                        <FormControlLabel control={<Switch checked={formData.is_active} onChange={e => setFormData({
                            ...formData,
                            is_active: e.target.checked
                        })}/>} label="Контракт активен"/>
                    </Stack>
                    <Button variant="contained" size="large" onClick={handleSave} disabled={loading}>
                        Сохранить и рассчитать
                    </Button>
                </Stack>
            </Box>
        </LocalizationProvider>
    );
};