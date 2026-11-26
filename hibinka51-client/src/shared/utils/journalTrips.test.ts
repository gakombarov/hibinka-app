// @vitest-environment node
import {describe, expect, it} from 'vitest';
import type {ScheduledTripResponse, TripResponse} from '../types/api';
import {groupJournalTrips, journalRoute, journalTotal, matchesJournalSearch} from './journalTrips';

const schedule: ScheduledTripResponse = {
    id: 'airport-contract', route_number: 1, client_name: 'Аэропорт',
    departure_location: 'а/п Хибины', destination: 'Мончегорск',
    total_contract_value: 20000, contract_start_date: '2026-11-01', contract_end_date: '2026-11-30',
    is_active: true, show_on_landing: false, price: 2000, stops: [],
    cycles: [{id: 'morning', schedule_id: 'airport-contract', days_of_week: 'Пн, Чт',
        departure_time: '08:00:00', return_time: '10:00:00'}],
};

function leg(id: string, overrides: Partial<TripResponse> = {}): TripResponse {
    return {
        id, trip_date: '2026-11-26', departure_time: '08:00:00',
        departure_location: 'а/п Хибины', arrival_location: 'Мончегорск',
        passenger_count: 5, is_regular: true, status: 'PLANNED',
        total_amount: 1000, paid_amount: 1000, payment_status: 'PAID',
        show_on_landing: false, has_trailer: false, notes: null, stops: [], display_status: 'По расписанию',
        booking_id: null, vehicle_id: null, driver_id: null, scheduled_trip_id: schedule.id,
        ...overrides,
    };
}

function roundTrip(prefix = ''): TripResponse[] {
    return [leg(`${prefix}out`), leg(`${prefix}back`, {
        departure_time: '10:00:00', departure_location: 'Мончегорск', arrival_location: 'а/п Хибины',
    })];
}

describe('journal round trips', () => {
    it('shows an existing airport round trip as one entry without changing either record', () => {
        const trips = roundTrip();
        trips[1].driver_id = 'return-driver';
        trips[1].status = 'IN_PROGRESS';
        const snapshot = structuredClone(trips);
        const entries = groupJournalTrips([...trips].reverse(), [schedule]);
        expect(entries).toHaveLength(1);
        expect(entries[0].legs).toEqual(trips);
        expect(journalRoute(entries[0])).toBe('а/п Хибины → Мончегорск → а/п Хибины');
        expect(journalTotal(entries[0])).toBe(2000);
        expect(trips).toEqual(snapshot);
    });

    it('keeps morning and evening cycles as two separate journeys', () => {
        const eveningSchedule = {...schedule, cycles: [...schedule.cycles, {
            ...schedule.cycles[0], id: 'evening', departure_time: '18:00:00', return_time: '20:00:00',
        }]};
        const trips = [...roundTrip(), ...roundTrip('evening-').map((trip, i) => ({
            ...trip, departure_time: i === 0 ? '18:00:00' : '20:00:00',
        }))];
        const entries = groupJournalTrips(trips, [eveningSchedule]);
        expect(entries.map(entry => entry.legs.map(trip => trip.id)))
            .toEqual([['out', 'back'], ['evening-out', 'evening-back']]);
    });

    it('does not combine identical routes belonging to different contracts or dates', () => {
        const trips = roundTrip();
        trips[1].scheduled_trip_id = 'other-contract';
        expect(groupJournalTrips(trips, [schedule])).toHaveLength(2);
        trips[1].scheduled_trip_id = schedule.id;
        trips[1].trip_date = '2026-11-27';
        expect(groupJournalTrips(trips, [schedule])).toHaveLength(2);
    });

    it('keeps an unmatched direction visible when filters or pagination omit its partner', () => {
        const entries = groupJournalTrips([roundTrip()[1]], [schedule]);
        expect(entries).toHaveLength(1);
        expect(entries[0].legs[0].id).toBe('back');
    });

    it('keeps all duplicate records visible instead of guessing a pairing', () => {
        const trips = [...roundTrip(), leg('duplicate-out')];
        expect(groupJournalTrips(trips, [schedule]).map(entry => entry.legs.length)).toEqual([1, 1, 1]);
    });

    it('rejects overlapping cycles that reuse one direction', () => {
        const overlapping = {...schedule, cycles: [...schedule.cycles, {
            ...schedule.cycles[0], id: 'overlap', return_time: '11:00:00',
        }]};
        const trips = [...roundTrip(), leg('other-back', {
            departure_time: '11:00:00', departure_location: 'Мончегорск', arrival_location: 'а/п Хибины',
        })];
        expect(groupJournalTrips(trips, [overlapping])).toHaveLength(3);
    });

    it('does not sum the same booking total twice or group ad hoc trips', () => {
        const booked = roundTrip().map(trip => ({...trip, booking_id: 'booking', total_amount: 2000}));
        expect(groupJournalTrips(booked, [schedule])).toHaveLength(2);
        expect(groupJournalTrips(roundTrip().map(trip => ({...trip, is_regular: false})), [schedule])).toHaveLength(2);
    });

    it('falls back to separate entries if schedules are unavailable or times do not match', () => {
        expect(groupJournalTrips(roundTrip(), [])).toHaveLength(2);
        const trips = roundTrip();
        trips[1].departure_time = '10:05:00';
        expect(groupJournalTrips(trips, [schedule])).toHaveLength(2);
    });

    it('checks the cycle weekday and still supports inactive historical schedules', () => {
        expect(groupJournalTrips(roundTrip(), [{...schedule, cycles: [{...schedule.cycles[0], days_of_week: 'Пт'}]}]))
            .toHaveLength(2);
        expect(groupJournalTrips(roundTrip(), [{...schedule, is_active: false}])).toHaveLength(1);
    });

    it('searches the full route and contract client without separating the journey', () => {
        const [entry] = groupJournalTrips(roundTrip(), [schedule]);
        expect(matchesJournalSearch(entry, ' МОНЧЕГОРСК ')).toBe(true);
        expect(matchesJournalSearch(entry, 'аэропорт')).toBe(true);
        expect(matchesJournalSearch(entry, 'Кировск')).toBe(false);
        expect(matchesJournalSearch(entry, '   ')).toBe(true);
    });
});
