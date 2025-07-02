// utils/api.ts
import axios from "axios";

const admin = axios.create(); // No baseURL

// Attach token to every request
admin.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: centralized error handling
admin.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default admin;
