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
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import {tripsApi} from "../api/trips";
import {TripResponse} from "../shared/types/api";

const COLORS = {
    PAGE_BG: "#F2F2F7", // Светло-серый macOS фон
    ACCENT_YELLOW: "#FFD60A", // Яркий Apple Yellow
    CARD_BG: "#FFFFFF",
    PALE_YELLOW: "#FFFBEB",
    BORDER: "rgba(0,0,0,0.05)",
};

const COLS = {
    TIME: 75,
    ROUTE: 280,
    CLIENT: 160,
    PASS: 60,
    TRAIL: 50,
    AUTO: 130,
    DRIVER: 130,
    PAID: 95,
    TOTAL: 95,
    STATUS: 150,
};

export const TripsJournal: React.FC = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<TripResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await tripsApi.getAll();
            setTrips(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdate = async (id: string, data: any) => {
        setTrips(prev => prev.map(t => t.id === id ? {...t, ...data} : t));
        try {
            await tripsApi.update(id, data);
        } catch (e) {
            loadData();
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

    const groupedTrips = useMemo(() => {
        const groups: Record<string, TripResponse[]> = {};
        trips.forEach(t => {
            if (!groups[t.trip_date]) groups[t.trip_date] = [];
            groups[t.trip_date].push(t);
        });
        return groups;
    }, [trips]);

    const cellSx = {
        padding: "10px 12px",
        borderRight: `1px solid ${COLORS.BORDER}`,
        borderBottom: `1px solid ${COLORS.BORDER}`,
        "&:last-child": {borderRight: "none"}
    };

    const inputSx = {
        "& .MuiInputBase-input": {
            fontSize: "0.9rem",
            fontWeight: 800,
            textAlign: "center",
            borderRadius: "8px",
            padding: "4px",
            "&:hover": {bgcolor: "rgba(0,0,0,0.03)"}
        },
        "& .MuiInputBase-root": {"&:before, &:after": {display: "none"}}
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', mt: 10}}><CircularProgress/></Box>;

    return (
        <Box sx={{p: 4, bgcolor: COLORS.PAGE_BG, minHeight: "100vh"}}>
            <Typography variant="h4" fontWeight="900" mb={4} sx={{letterSpacing: "-0.04em", color: "#1D1D1F"}}>
                Журнал рейсов
            </Typography>

            {Object.entries(groupedTrips).sort((a, b) => dayjs(b[0]).diff(dayjs(a[0]))).map(([date, dayTrips]) => (
                <Accordion
                    key={date}
                    defaultExpanded
                    elevation={0}
                    sx={{
                        mb: 3,
                        bgcolor: "transparent",
                        "&:before": {display: "none"}
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        sx={{
                            bgcolor: COLORS.ACCENT_YELLOW,
                            borderRadius: "16px", // Мак-стайл закругление
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            mb: 1.5,
                            "&.Mui-expanded": {minHeight: 56}
                        }}
                    >
                        <Typography variant="h6" fontWeight="900" color="black">
                            {dayjs(date).locale("ru").format("DD MMMM, dddd").toUpperCase()}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{p: 0}}>
                        <TableContainer component={Paper} sx={{
                            borderRadius: "20px", // Сильное закругление таблицы
                            overflow: "hidden",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                            border: `1px solid ${COLORS.BORDER}`
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
                                        <TableCell
                                            sx={{...cellSx, width: COLS.PAID, textAlign: 'right'}}>Оплата</TableCell>
                                        <TableCell
                                            sx={{...cellSx, width: COLS.TOTAL, textAlign: 'right'}}>Итого</TableCell>
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

                                        return (
                                            <TableRow key={trip.id} sx={{
                                                bgcolor: rowBg,
                                                "&:hover": {bgcolor: alpha(COLORS.ACCENT_YELLOW, 0.05)}
                                            }}>
                                                <TableCell sx={cellSx}>
                                                    <TextField
                                                        variant="standard"
                                                        defaultValue={trip.departure_time.slice(0, 5)}
                                                        onBlur={(e) => handleUpdate(trip.id, {departure_time: e.target.value})}
                                                        sx={{
                                                            ...inputSx,
                                                            "& .MuiInputBase-input": {
                                                                textAlign: 'left',
                                                                fontWeight: 900
                                                            }
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={cellSx}>
                                                    <Typography variant="body2" fontWeight="900" color="#1D1D1F">
                                                        {trip.departure_location} → {trip.arrival_location}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={cellSx}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{minWidth: 0}}>
                                                            <Typography variant="caption" fontWeight="900" color="black"
                                                                        display="block">
                                                                {trip.customer?.first_name?.toUpperCase() || "ТЕНДЕР"}
                                                            </Typography>
                                                            <Typography variant="caption" color="primary"
                                                                        sx={{fontWeight: 800, fontSize: '0.65rem'}}>
                                                                {trip.customer?.phone || "НЕТ НОМЕРА"}
                                                            </Typography>
                                                        </Box>
                                                        <IconButton size="small"
                                                                    onClick={() => navigate(`/dashboard/bookings/${trip.booking_id}`)}>
                                                            <OpenInNewIcon sx={{fontSize: 14, color: "#86868B"}}/>
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell sx={{...cellSx, textAlign: 'center'}}>
                                                    <TextField
                                                        type="number" variant="standard"
                                                        defaultValue={trip.passenger_count}
                                                        onBlur={(e) => handleUpdate(trip.id, {passenger_count: Number(e.target.value)})}
                                                        sx={inputSx}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{...cellSx, textAlign: 'center'}}>
                                                    <Checkbox
                                                        size="small" checked={trip.has_trailer}
                                                        onChange={(e) => handleUpdate(trip.id, {has_trailer: e.target.checked})}
                                                        sx={{borderRadius: "4px"}}
                                                    />
                                                </TableCell>

                                                <TableCell sx={cellSx}>
                                                    <Button fullWidth size="small" variant="outlined" sx={{
                                                        borderRadius: "10px",
                                                        fontSize: "0.65rem",
                                                        fontWeight: 800,
                                                        borderStyle: 'dashed',
                                                        color: "#515154"
                                                    }}>
                                                        Выбрать авто
                                                    </Button>
                                                </TableCell>

                                                <TableCell sx={cellSx}>
                                                    <Button fullWidth size="small" variant="outlined" sx={{
                                                        borderRadius: "10px",
                                                        fontSize: "0.65rem",
                                                        fontWeight: 800,
                                                        borderStyle: 'dashed',
                                                        color: "#515154"
                                                    }}>
                                                        Выбрать вод.
                                                    </Button>
                                                </TableCell>

                                                <TableCell sx={cellSx}>
                                                    <TextField
                                                        variant="standard" defaultValue={trip.paid_amount || 0}
                                                        onBlur={(e) => handleUpdate(trip.id, {paid_amount: Number(e.target.value)})}
                                                        sx={{
                                                            ...inputSx,
                                                            "& .MuiInputBase-input": {
                                                                textAlign: 'right',
                                                                color: isFullyPaid ? "#34C759" : "#FF3B30"
                                                            }
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={cellSx}>
                                                    <TextField
                                                        variant="standard" defaultValue={trip.total_amount || 0}
                                                        onBlur={(e) => handleUpdate(trip.id, {total_amount: Number(e.target.value)})}
                                                        sx={{
                                                            ...inputSx,
                                                            "& .MuiInputBase-input": {
                                                                textAlign: 'right',
                                                                color: "#1D1D1F"
                                                            }
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{...cellSx, borderRight: 'none'}}>
                                                    <Select
                                                        value={trip.status} size="small" fullWidth variant="standard"
                                                        disableUnderline
                                                        onChange={(e) => handleUpdate(trip.id, {status: e.target.value})}
                                                        renderValue={(v) => {
                                                            const cfg = getStatusConfig(v as string);
                                                            return (
                                                                <Chip label={cfg.label} color={cfg.color} size="small"
                                                                      sx={{
                                                                          fontWeight: 900,
                                                                          fontSize: "0.6rem",
                                                                          borderRadius: "8px",
                                                                          width: "100%",
                                                                          height: 22
                                                                      }}/>
                                                            );
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
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};