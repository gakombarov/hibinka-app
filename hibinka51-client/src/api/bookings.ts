import apiClient from "./client";
import { BookingFormData } from "@shared/components/ui/BookingForm";

export const submitPublicBooking = async (data: BookingFormData) => {
  const payload = {
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email || null,
    desired_trip_date: data.booking_date,
    desired_departure_time: data.booking_time + ":00",
    desired_trip_location: data.departure_location,
    arrival_location: data.arrival_location,
    passenger_count: Number(data.passenger_count),
    luggage_description: data.luggage || null,
    notes: data.comments || null,
  };

  const response = await apiClient.post("/bookings/public/booking/", payload);
  return response.data;
};

export const fetchAdminBookings = async (skip = 0, limit = 100) => {
  const response = await apiClient.get("/bookings/", {
    params: { skip, limit },
  });
  return response.data;
};
