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

export interface TripResponse {
  id: string;
  trip_date: string;
  departure_time: string;
  departure_location: string;
  arrival_location: string;
  is_regular: boolean;
  status: TripStatus;
  planned_amount: number;
  actual_amount: number | null;
  payment_status: PaymentStatus;
  show_on_landing: boolean;
  notes: string | null;
  stops: TripStop[];
  display_status: string;
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
    first_name: string;
    phone: string;
  };
  luggage_description?: string | null;
  notes?: string | null;
}
