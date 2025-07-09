// utils/api.ts
import axios from "axios";

// Configure base URL based on environment
const baseURL = import.meta.env.VITE_NODE_ENV === "production" 
  ? 'https://quickcash.oyefin.com' 
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug logging for API requests
  console.log('API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    fullUrl: `${config.baseURL}${config.url}`,
    headers: config.headers
  });
  
  return config;
});

// Optional: centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      fullUrl: `${error.config?.baseURL}${error.config?.url}`
    });
    return Promise.reject(error);
  }
);

export default api;
