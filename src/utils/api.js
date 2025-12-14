// utils/api.js
import axios from "axios";

export const API = axios.create({
  baseURL: "https://dr-vehicle-backend.onrender.com", // <- your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add a request interceptor to include token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
