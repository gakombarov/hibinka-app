import apiClient from "./client";

export const tripsApi = {
    getAll: async (includeCancelled: boolean = false) => {
        const response = await apiClient.get("/trips/", {
            params: {include_cancelled: includeCancelled}
        });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`/trips/${id}`);
        return response.data;
    },

    assignVehicle: async (tripId: string, vehicleId: string, splitIfNeeded: boolean = false) => {
        const response = await apiClient.patch(`/trips/${tripId}/assign-vehicle`, {
            vehicle_id: vehicleId,
            split_if_needed: splitIfNeeded
        });
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await apiClient.patch(`/trips/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/trips/${id}`);
        return response.data;
    }
};