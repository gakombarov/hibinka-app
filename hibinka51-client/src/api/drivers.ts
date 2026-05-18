import apiClient from "./client";

export const getDrivers = async (params?: {
    skip?: number; limit?: number; search?: string;
    status?: string; is_external?: string;
    sort_by?: string; sort_dir?: string;
}) => {
    const response = await apiClient.get("/drivers/", {params});
    return response.data;
};

export const createDriver = async (data: any) => {
    const response = await apiClient.post("/drivers/", data);
    return response.data;
};

export const updateDriver = async (id: string, data: any) => {
    const response = await apiClient.patch(`/drivers/${id}`, data);
    return response.data;
};

export const deleteDriver = async (id: string) => {
    const response = await apiClient.delete(`/drivers/${id}`);
    return response.data;
};

export const driversApi = {
    getAll: () => getDrivers({limit: 100}),
    create: createDriver,
    update: updateDriver,
    delete: deleteDriver
};