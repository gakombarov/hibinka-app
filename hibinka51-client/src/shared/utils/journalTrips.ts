import type {ScheduledTripResponse, TripResponse} from '../types/api';

export interface JournalTrip {
    id: string;
    trip_date: string;
    departure_time: string;
    legs: TripResponse[];
    clientName?: string | null;
}

/** Match only an unambiguous pair from the same schedule and exact cycle times. */
export function groupJournalTrips(
    trips: TripResponse[],
    schedules: ScheduledTripResponse[],
): JournalTrip[] {
    const pairs: [TripResponse, TripResponse][] = [];
    const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    const scheduleById = new Map(schedules.map(schedule => [schedule.id, schedule]));

    const byScheduleAndDate = new Map<string, TripResponse[]>();
    for (const trip of trips) {
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
        clientName: scheduleById.get(trip.scheduled_trip_id ?? '')?.client_name,
    }));
}

export function journalRoute(entry: JournalTrip): string {
    return [entry.legs[0].departure_location, ...entry.legs.map(trip => trip.arrival_location)].join(' → ');
}

export function journalTotal(entry: JournalTrip): number {
    // Only schedule legs are combined; each stores its own part of the contract price.
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
