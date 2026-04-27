import apiClient from "./client";

export const getOrganizations = async (params: { skip?: number; limit?: number; search?: string; is_active?: string }) => {
  const response = await apiClient.get("/customers/organizations", { params });
  return response.data;
};

export const createOrganization = async (data: any) => {
  const response = await apiClient.post("/customers/organizations", data);
  return response.data;
};

export const updateOrganization = async (id: string, data: any) => {
  const response = await apiClient.patch(`/customers/organizations/${id}`, data);
  return response.data;
};

export const deleteOrganization = async (id: string) => {
  const response = await apiClient.delete(`/customers/organizations/${id}`);
  return response.data;
};

export const getContacts = async (params: { skip?: number; limit?: number; search?: string; organization_id?: string }) => {
  const response = await apiClient.get("/customers/contacts", { params });
  return response.data;
};

export const createContact = async (data: any) => {
  const response = await apiClient.post("/customers/contacts", data);
  return response.data;
};

export const updateContact = async (id: string, data: any) => {
  const response = await apiClient.patch(`/customers/contacts/${id}`, data);
  return response.data;
};

export const deleteContact = async (id: string) => {
  const response = await apiClient.delete(`/customers/contacts/${id}`);
  return response.data;
};
