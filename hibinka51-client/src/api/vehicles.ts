import apiClient from "./client";

export const getAllVehicles = async (params: { skip: number; limit: number; sortKey: string; sortDir: string; filterCategory: string; filterCapacity: string; filterActive: string }) => {
  const { skip, limit, sortKey, sortDir, filterCategory, filterCapacity, filterActive } = params;
  const response = await apiClient.get("/vehicles/", {
    params: {
      skip,
      limit,
      sort_by: sortKey,
      sort_dir: sortDir,
      ...(filterCategory && { category: filterCategory }),
      ...(filterCapacity && { min_capacity: filterCapacity }),
      ...(filterActive !== '' && { is_active: filterActive }),
    },
  });
  return response.data;
};

export const createVehicle = async (data: any) => {
  const response = await apiClient.post("/vehicles/", data);
  return response.data;
};

export const updateVehicle = async (data: any) => {
  const response = await apiClient.patch(`/vehicles/${data.id}`, data);
  return response.data;
};

export const deleteVehicle = async (id: string) => {
  const response = await apiClient.delete(`/vehicles/${id}`);
  return response.data;
};