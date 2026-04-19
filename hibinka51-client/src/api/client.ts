import axios from "axios";
import { store } from "../store/store";
import { logout } from "../store/authSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${BASE_URL}/api/v1/auth/refresh?refresh_token=${refreshToken}`,
          );

          const { access_token, refresh_token: new_refresh } = response.data;

          localStorage.setItem("token", access_token);
          if (new_refresh) {
            localStorage.setItem("refresh_token", new_refresh);
          }

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          store.dispatch(logout());
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        store.dispatch(logout());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
