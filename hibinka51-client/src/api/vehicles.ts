import apiClient from "./client";
import { Vehicle } from "../shared/types/api";

export const vehiclesApi = {
    getAll: async (params: any = {}) => {
        const { skip = 0, limit = 100, sortKey, sortDir, filterCategory, filterCapacity, filterActive } = params;
        const response = await apiClient.get("/vehicles/", {
            params: {
                skip,
                limit,
                ...(sortKey && { sort_by: sortKey }),
                ...(sortDir && { sort_dir: sortDir }),
                ...(filterCategory && { category: filterCategory }),
                ...(filterCapacity && { min_capacity: filterCapacity }),
                ...(filterActive !== '' && filterActive !== undefined && { is_active: filterActive }),
            },
        });
        return response.data;
    },
    create: async (data: Partial<Vehicle>) => {
        const response = await apiClient.post("/vehicles/", data);
        return response.data;
    },
    update: async (id: string, data: Partial<Vehicle>) => {
        const response = await apiClient.patch(`/vehicles/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/vehicles/${id}`);
        return response.data;
    }
};