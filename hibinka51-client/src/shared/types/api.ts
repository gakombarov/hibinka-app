export type VehicleCategory = "CAR" | "MINIBUS" | "BUS";

export type TripStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID";
export type BookingSource = "PHONE" | "EMAIL" | "WEBSITE" | "MESSENGER";
export type BookingStatus =
    | "NEW"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export interface TripStop {
    location: string;
    stop_order: number;
    time?: string;
}

export interface TripCustomerInfo {
    first_name: string;
    phone: string;
}

export interface TripBookingInfo {
    total_amount: number;
    paid_amount: number;
    customer?: TripCustomerInfo;
}

export interface Trip {
    id: string;
    trip_date: string;
    departure_time: string;
    departure_location: string;
    arrival_location: string;
    passenger_count: number;
    is_regular: boolean;
    status: TripStatus;
    total_amount: number;
    paid_amount: number;
    payment_status: PaymentStatus;
    show_on_landing: boolean;
    has_trailer: boolean;
    notes: string | null;
    stops: TripStop[];
    display_status: string;
    booking_id: string | null;
    vehicle_id: string | null;
    driver_id: string | null;
    scheduled_trip_id: string | null;
    customer?: TripCustomerInfo | null;
    booking?: TripBookingInfo | null;
    vehicle?: Vehicle | null;
}

export type TripResponse = Trip;

export interface TripUpdate {
    status?: TripStatus;
    payment_status?: PaymentStatus;
    total_amount?: number;
    paid_amount?: number;
    departure_time?: string;
    has_trailer?: boolean;
    notes?: string;
    passenger_count?: number;
    driver_id?: string;
    vehicle_id?: string;
}

export interface BookingCreatePublic {
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    desired_trip_date: string;
    desired_departure_time: string;
    desired_trip_location: string;
    arrival_location: string;
    passenger_count: number;
    luggage_description?: string | null;
    notes?: string | null;
    is_round_trip: boolean;
    return_date?: string | null;
    return_time?: string | null;
}

export interface BookingCreateAdmin extends BookingCreatePublic {
    source: BookingSource;
    total_amount?: number;
    paid_amount?: number;
}

export interface Booking {
    id: string;
    desired_trip_date: string;
    desired_departure_time: string;
    desired_trip_location: string;
    arrival_location: string;
    passenger_count: number;
    status: BookingStatus;
    customer?: {
        id: string;
        first_name: string;
        phone: string;
        email: string | null;
    };
    luggage_description?: string | null;
    notes?: string | null;
    is_round_trip: boolean;
    return_date?: string | null;
    return_time?: string | null;
    total_amount: number;
    paid_amount: number;
    trips?: Trip[];
}

export interface BookingConfirm {
    total_amount: number;
    paid_amount: number;
    has_trailer: boolean;
    notes?: string;
}


export interface Vehicle {
    id: string;
    alias: string;
    brand: string;
    model: string;
    license_plate: string;
    capacity: number;
    category: VehicleCategory;
    is_active: boolean;
}

export interface ScheduledTripStopCreate {
    stop_order: number;
    location: string;
    stop_time?: string | null;
    description?: string | null;
}

export interface ScheduledTripStopResponse extends ScheduledTripStopCreate {
    id: string;
    schedule_id: string;
}

export interface ScheduledTripCycleCreate {
    days_of_week: string;
    departure_time: string;
    return_time: string;
}

export interface ScheduledTripCycleResponse extends ScheduledTripCycleCreate {
    id: string;
    schedule_id: string;
}

export interface ScheduledTripCreate {
    route_number: number;
    client_name?: string | null;
    departure_location: string;
    destination: string;

    total_contract_value: number;
    contract_start_date: string;
    contract_end_date: string;

    is_active: boolean;
    show_on_landing: boolean;
    notes?: string | null;

    cycles: ScheduledTripCycleCreate[];
    stops: ScheduledTripStopCreate[];
}

export interface ScheduledTripResponse extends Omit<ScheduledTripCreate, 'cycles' | 'stops'> {
    id: string;
    price: number;
    cycles: ScheduledTripCycleResponse[];
    stops: ScheduledTripStopResponse[];
}

export const createScheduledTrip = async (data: ScheduledTripCreate): Promise<ScheduledTripResponse> => {
    const response = await api.post('/scheduled_trips/', data);
    return response.data;
};

export const triggerTripsSync = async (): Promise<{ status: string; message: string }> => {
    const response = await api.post('/scheduled_trips/sync');
    return response.data;
};
export interface Organization {
  id: string;
  name: string;
  notes: string | null;
  is_active: boolean;
}

export interface Contact {
  id: string;
  phone: string;
  full_name: string;
  organization_id: string | null;
  user_id: string | null;
  organization: Organization | null;
}

export type DriverStatus = "READY" | "BUSY" | "OFF_DUTY";

export interface DriverProfile {
  id: string;
  call_sign: string;
  phone: string;
  is_external: boolean;
  status: DriverStatus;
  user_id: string | null;
}
