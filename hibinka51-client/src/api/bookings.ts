import axios from "axios";
import { BookingFormData } from "@shared/components/ui/BookingForm";

const API_URL = "http://localhost:8000/api/v1/bookings";

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

  const response = await axios.post(`${API_URL}/public/booking/`, payload);
  return response.data;
};

export const fetchAdminBookings = async (
  token: string,
  skip = 0,
  limit = 100,
) => {
  const response = await axios.get(`${API_URL}/?skip=${skip}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
