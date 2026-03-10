import apiClient from "./client"; // Проверь, что импорт именно такой!

export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await apiClient.post(
      "/auth/login/access-token",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data;
  },

  getMe: async () => {
    // Здесь тоже: путь относительно /api/v1
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
