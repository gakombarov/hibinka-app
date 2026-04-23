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
}

export type TripResponse = Trip;

export interface TripUpdate {
  status?: TripStatus;
  payment_status?: PaymentStatus;
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
