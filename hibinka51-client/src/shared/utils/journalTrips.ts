import type {ScheduledTripResponse, TripResponse} from '../types/api';

export interface JournalTrip {
    id: string;
    trip_date: string;
    departure_time: string;
    legs: TripResponse[];
    clientName?: string | null;
}

/** Match only unambiguous directions from the same schedule cycle or round-trip booking. */
export function groupJournalTrips(
    trips: TripResponse[],
    schedules: ScheduledTripResponse[],
): JournalTrip[] {
    const pairs: [TripResponse, TripResponse][] = [];
    const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    const scheduleById = new Map(schedules.map(schedule => [schedule.id, schedule]));

    const byScheduleAndDate = new Map<string, TripResponse[]>();
    const byBooking = new Map<string, TripResponse[]>();
    for (const trip of trips) {
        if (trip.booking_id && !trip.scheduled_trip_id) {
            const bucket = byBooking.get(trip.booking_id) ?? [];
            bucket.push(trip);
            byBooking.set(trip.booking_id, bucket);
        }
        if (!trip.is_regular || !trip.scheduled_trip_id || trip.booking_id) continue;
        const key = `${trip.scheduled_trip_id}:${trip.trip_date}`;
        const bucket = byScheduleAndDate.get(key) ?? [];
        bucket.push(trip);
        byScheduleAndDate.set(key, bucket);
    }

    for (const candidates of byScheduleAndDate.values()) {
        const schedule = scheduleById.get(candidates[0].scheduled_trip_id!);
        // A circular schedule has indistinguishable directions; keep its records separate.
        if (!schedule || schedule.departure_location === schedule.destination) continue;
        const weekday = days[new Date(`${candidates[0].trip_date}T12:00:00Z`).getUTCDay()];

        for (const cycle of schedule.cycles) {
            const activeDays = cycle.days_of_week.split(',').map(day => day.trim().toLowerCase());
            if (!activeDays.includes(weekday)) continue;

            const forward = candidates.filter(trip =>
                trip.departure_location === schedule.departure_location &&
                trip.arrival_location === schedule.destination &&
                trip.departure_time === cycle.departure_time,
            );
            const backward = candidates.filter(trip =>
                trip.departure_location === schedule.destination &&
                trip.arrival_location === schedule.departure_location &&
                trip.departure_time === cycle.return_time,
            );
            if (forward.length === 1 && backward.length === 1) pairs.push([forward[0], backward[0]]);
        }
    }

    for (const candidates of byBooking.values()) {
        // Split passenger groups and incomplete bookings remain separate.
        if (candidates.length !== 2) continue;
        const booking = candidates[0].booking;
        if (!booking?.is_round_trip) continue;
        const forward = candidates.filter(trip => trip.trip_date === booking.desired_trip_date &&
            trip.departure_time === booking.desired_departure_time);
        const backward = candidates.filter(trip => trip.trip_date === booking.return_date &&
            trip.departure_time === booking.return_time);
        if (forward.length !== 1 || backward.length !== 1 || forward[0].id === backward[0].id) continue;
        if (forward[0].departure_location !== backward[0].arrival_location ||
            forward[0].arrival_location !== backward[0].departure_location) continue;
        pairs.push([forward[0], backward[0]]);
    }

    // Overlapping cycles or duplicate records must never silently consume a direction.
    const uses = new Map<string, number>();
    for (const pair of pairs) {
        for (const trip of pair) uses.set(trip.id, (uses.get(trip.id) ?? 0) + 1);
    }
    const paired = new Map<string, [TripResponse, TripResponse]>();
    const returnIds = new Set<string>();
    for (const pair of pairs) {
        if (pair.some(trip => uses.get(trip.id) !== 1)) continue;
        paired.set(pair[0].id, pair);
        returnIds.add(pair[1].id);
    }

    return trips.filter(trip => !returnIds.has(trip.id)).map(trip => ({
        id: trip.id,
        trip_date: trip.trip_date,
        departure_time: trip.departure_time,
        legs: paired.get(trip.id) ?? [trip],
        clientName: scheduleById.get(trip.scheduled_trip_id ?? '')?.client_name ||
            trip.customer?.first_name || trip.booking?.customer?.first_name,
    }));
}

export function journalRoute(entry: JournalTrip): string {
    return [entry.legs[0].departure_location, ...entry.legs.map(trip => trip.arrival_location)].join(' → ');
}

export function journalTotal(entry: JournalTrip): number {
    // Booking legs share one total; schedule legs each store a part of the contract price.
    const first = entry.legs[0];
    if (first.booking_id) return Number(first.booking?.total_amount ?? first.total_amount ?? 0);
    return entry.legs.reduce((total, trip) => total + Number(trip.total_amount ?? 0), 0);
}

export function matchesJournalSearch(entry: JournalTrip, query: string): boolean {
    const q = query.trim().toLocaleLowerCase('ru');
    if (!q) return true;
    return [
        journalRoute(entry), entry.clientName,
        ...entry.legs.flatMap(trip => [trip.customer?.first_name, trip.customer?.phone]),
    ].some(value => value?.toLocaleLowerCase('ru').includes(q));
}
