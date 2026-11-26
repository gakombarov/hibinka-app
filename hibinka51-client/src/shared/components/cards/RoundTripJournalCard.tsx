import {useState, type ReactNode} from 'react';
import {Box, Button, Chip, Collapse, Paper, Stack, Typography} from '@mui/material';
import type {JournalTrip} from '../../utils/journalTrips';
import {journalRoute, journalTotal} from '../../utils/journalTrips';
import type {TripResponse} from '../../types/api';

const statusLabels: Record<string, string> = {
    PLANNED: 'Ожидание', IN_PROGRESS: 'В пути', COMPLETED: 'Завершен', CANCELLED: 'Отменен',
};

interface Props {
    entry: JournalTrip;
    assignmentFor: (trip: TripResponse) => string;
    children: ReactNode;
}

/** One journey in the journal, with independent direction controls inside. */
export function RoundTripJournalCard({entry, assignmentFor, children}: Props) {
    const [expanded, setExpanded] = useState(false);
    const detailsId = `round-trip-${entry.id}`;

    return (
        <Paper elevation={0} sx={{p: {xs: 2, md: 2.5}, borderRadius: '18px', mb: 1.5,
            border: '1px solid rgba(0,0,0,0.08)', bgcolor: '#FFFBEB'}}>
            <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" gap={1}>
                <Box>
                    <Chip label="Туда и обратно" size="small" sx={{mb: 1, bgcolor: '#FFD60A', fontWeight: 800}}/>
                    <Typography fontWeight={900} sx={{fontSize: '1rem', lineHeight: 1.5}}>
                        {journalRoute(entry)}
                    </Typography>
                    <Typography sx={{fontSize: '0.875rem', color: '#515154', mt: 0.5}}>
                        {entry.clientName || (entry.legs[0].scheduled_trip_id ? 'По контракту' : 'Клиент не указан')}
                    </Typography>
                </Box>
                <Box sx={{textAlign: {xs: 'left', sm: 'right'}}}>
                    <Typography fontWeight={900} sx={{fontSize: '1.125rem'}}>
                        {journalTotal(entry).toLocaleString('ru-RU')} ₽
                    </Typography>
                    <Typography sx={{fontSize: '0.875rem', color: '#515154'}}>За весь рейс</Typography>
                </Box>
            </Stack>
            <Stack spacing={1} sx={{mt: 1.5}}>
                {entry.legs.map((trip, index) => (
                    <Box key={trip.id}>
                        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
                            <Typography sx={{fontSize: '0.875rem', fontWeight: 800}}>
                                {index === 0 ? 'Туда' : 'Обратно'}: {trip.trip_date !== entry.trip_date && `${trip.trip_date.split('-').reverse().join('.')} `}{trip.departure_time.slice(0, 5)} · {trip.departure_location}
                            </Typography>
                            <Chip label={statusLabels[trip.status] || trip.status} size="small"
                                color={trip.status === 'CANCELLED' ? 'error' : trip.status === 'COMPLETED' ? 'success' : 'default'}/>
                        </Stack>
                        <Typography sx={{fontSize: '0.875rem', color: '#515154', mt: 0.5}}>
                            {assignmentFor(trip)}
                        </Typography>
                    </Box>
                ))}
            </Stack>
            <Button onClick={() => setExpanded(value => !value)} aria-expanded={expanded}
                aria-controls={detailsId} sx={{mt: 1.5, fontWeight: 800, minHeight: 44}}>
                {expanded ? 'Скрыть направления' : 'Управление направлениями'}
            </Button>
            <Collapse in={expanded} id={detailsId}>
                <Typography sx={{fontSize: '0.875rem', color: '#515154', my: 1.5}}>
                    Водитель, транспорт, пассажиры и статус задаются для каждого направления.
                </Typography>
                {children}
            </Collapse>
        </Paper>
    );
}
