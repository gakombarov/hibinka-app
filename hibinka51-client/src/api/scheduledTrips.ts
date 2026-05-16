import apiClient from "./client";
import {ScheduledTripCreate, ScheduledTripResponse} from "../shared/types/api";

export const scheduledTripsApi = {
    getPublic: async (): Promise<ScheduledTripResponse[]> => {
        const response = await apiClient.get("/scheduled_trips/public/");
        return response.data;
    },

    getAllAdmin: async (): Promise<ScheduledTripResponse[]> => {
        const response = await apiClient.get("/scheduled_trips/");
        return response.data;
    },

    getById: async (id: string): Promise<ScheduledTripResponse> => {
        const response = await apiClient.get(`/scheduled_trips/${id}`);
        return response.data;
    },

    create: async (data: ScheduledTripCreate): Promise<ScheduledTripResponse> => {
        const response = await apiClient.post("/scheduled_trips/", data);
        return response.data;
    },

    update: async (id: string, data: Partial<ScheduledTripCreate>): Promise<ScheduledTripResponse> => {
        const response = await apiClient.patch(`/scheduled_trips/${id}`, data);
        return response.data;
    },

    toggleActive: async (id: string, is_active: boolean) => {
        const response = await apiClient.patch(`/scheduled_trips/${id}`, {is_active});
        return response.data;
    },

    triggerSync: async () => {
        const response = await apiClient.post("/scheduled_trips/sync");
        return response.data;
    },
};