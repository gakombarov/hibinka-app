import apiClient from "./client";
import {TripResponse, TripUpdate} from "../shared/types/api";

export interface TripCreate {
    trip_date: string;
    departure_time: string;
    departure_location: string;
    arrival_location: string;
    is_regular?: boolean;
    passenger_count?: number;
    total_amount?: number;
    paid_amount?: number;
    notes?: string;
}

export const tripsApi = {
    /**
     * Получить список всех поездок (для Журнала)
     */
    getAll: async (skip = 0, limit = 100): Promise<TripResponse[]> => {
        const response = await apiClient.get("/trips/", {
            params: {skip, limit},
        });
        return response.data;
    },

    /**
     * Создать новую поездку вручную
     */
    create: async (tripData: TripCreate): Promise<TripResponse> => {
        const response = await apiClient.post("/trips/", tripData);
        return response.data;
    },

    /**
     * Обновить существующую поездку
     */
    update: async (id: string, tripData: TripUpdate): Promise<TripResponse> => {
        const response = await apiClient.patch(`/trips/${id}`, tripData);
        return response.data;
    },
};

export const fetchAdminTrips = tripsApi.getAll;