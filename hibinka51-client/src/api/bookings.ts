import apiClient from "./client";
import { BookingFormData } from "@shared/components/ui/BookingForm";
import { Booking, BookingConfirm } from "@shared/types/api";

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

  const response = await apiClient.post("/bookings/public/booking", payload);
  return response.data;
};

export const fetchAdminBookings = async (skip = 0, limit = 100) => {
  const response = await apiClient.get("/bookings/", {
    params: { skip, limit },
  });
  return response.data;
};

export const getBooking = async (id: string): Promise<Booking> => {
  const response = await apiClient.get(`/bookings/${id}`);
  return response.data;
};

export const updateBooking = async (id: string, data: Partial<Booking>) => {
  const response = await apiClient.patch(`/bookings/${id}`, data);
  return response.data;
};

export const confirmBookingToTrip = async (
  bookingId: string,
  data: BookingConfirm,
): Promise<Booking> => {
  const response = await apiClient.post(`/bookings/${bookingId}/confirm`, data);
  return response.data;
};

export const createAdminBooking = async (data: any) => {
  const response = await apiClient.post("/bookings/", data);
  return response.data;
};
