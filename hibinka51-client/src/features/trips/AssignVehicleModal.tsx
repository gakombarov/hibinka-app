import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Typography
} from '@mui/material';
import {Trip, Vehicle} from '../../shared/types/api';
import dayjs from 'dayjs';

interface Props {
    open: boolean;
    onClose: () => void;
    vehicles?: Vehicle[];
    allTrips: Trip[];
    trip: Trip | null;
    onAssign: (vehicleId: string, split: boolean) => Promise<void>;
    isLoading: boolean;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper',
    boxShadow: 24, p: 4, borderRadius: 2
};

export const AssignVehicleModal: React.FC<Props> = ({
                                                        open,
                                                        onClose,
                                                        vehicles = [],
                                                        allTrips = [],
                                                        trip,
                                                        onAssign,
                                                        isLoading
                                                    }) => {
    const [selectedId, setSelectedId] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (!open) setSelectedId('');
    }, [open]);


    const isVehicleBusy = (vehicleId: string) => {
        if (!trip) return false;

        return allTrips.some(t => {
            if (t.vehicle_id !== vehicleId || t.id === trip.id || t.trip_date !== trip.trip_date) {
                return false;
            }


            const currentStart = dayjs(`${trip.trip_date}T${trip.departure_time}`);
            const otherStart = dayjs(`${t.trip_date}T${t.departure_time}`);

            const diffMinutes = Math.abs(currentStart.diff(otherStart, 'minute'));
            return diffMinutes < 20;
        });
    };

    const handleAction = () => {
        const v = vehicles.find(x => x.id === selectedId);
        if (v && trip && v.capacity < trip.passenger_count) {
            setConfirmOpen(true);
        } else {
            onAssign(selectedId, false);
        }
    };

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Box sx={style}>
                    <Typography variant="h6" mb={2} fontWeight="bold">Назначить транспорт</Typography>

                    <FormControl fullWidth sx={{mb: 3}}>
                        <InputLabel>Машина</InputLabel>
                        <Select
                            value={selectedId}
                            label="Машина"
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            {vehicles.map((v) => {
                                const busy = isVehicleBusy(v.id);
                                return (
                                    <MenuItem
                                        key={v.id}
                                        value={v.id}
                                        disabled={busy}
                                        sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                                    >
                                        <Typography sx={{opacity: busy ? 0.5 : 1}}>
                                            {v.brand} {v.model} ({v.capacity} мест)
                                        </Typography>

                                        {busy && (
                                            <Chip
                                                label="ЗАНЯТА"
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                sx={{ml: 1, fontWeight: 'bold', fontSize: '0.65rem'}}
                                            />
                                        )}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button onClick={onClose} color="inherit">Отмена</Button>
                        <Button
                            variant="contained"
                            onClick={handleAction}
                            disabled={!selectedId || isLoading}
                        >
                            {isLoading ? <CircularProgress size={24}/> : 'Ок'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{fontWeight: 'bold'}}>Мест не хватает</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вместимость машины меньше количества пассажиров. Создать дополнительный рейс для балансировки?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button onClick={() => setConfirmOpen(false)} color="inherit">Нет</Button>
                    <Button
                        onClick={() => {
                            setConfirmOpen(false);
                            onAssign(selectedId, true);
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Да, создать
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};