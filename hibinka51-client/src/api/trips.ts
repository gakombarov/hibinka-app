import apiClient from "./client";

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
  getAllTrips: async (skip = 0, limit = 100): Promise<Trip[]> => {
    const response = await apiClient.get("/trips/", {
      params: { skip, limit },
    });
    return response.data;
  },

  createTrip: async (tripData: TripCreate): Promise<Trip> => {
    const response = await apiClient.post("/trips/", tripData);
    return response.data;
  },
};
