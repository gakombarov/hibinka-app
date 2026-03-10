import axios from "axios";

// URL бэкенда
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface Trip {
  id: string | number;
  trip_date: string;
  departure_time: string;
  departure_location: string;
  arrival_location: string;
  is_regular: boolean;
  status: string;
  display_status?: string;
  passenger_count: number;
  planned_amount: number;
  driver_id?: string | number | null;
}

export interface TripCreate {
  trip_date: string;
  departure_time: string;
  departure_location: string;
  arrival_location: string;
  is_regular?: boolean;
  planned_amount?: number;
  passenger_count?: number;
  notes?: string;
}

export const tripsApi = {
  getAllTrips: async (
    token: string,
    skip = 0,
    limit = 100,
  ): Promise<Trip[]> => {
    const response = await axios.get(`${API_URL}/trips/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { skip, limit },
    });
    return response.data;
  },

  createTrip: async (token: string, tripData: TripCreate): Promise<Trip> => {
    const response = await axios.post(`${API_URL}/trips/`, tripData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
