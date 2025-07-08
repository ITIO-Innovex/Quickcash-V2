// utils/api.ts
import axios from "axios";

const api = axios.create(); // No baseURL

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
     return Promise.reject(error);
  }
);

export default api;
