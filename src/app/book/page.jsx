// utils/api.js
import axios from "axios";

const BASE_URL = "https://dr-vehicle-backend.onrender.com";

// ✅ Public API (no Authorization header)
export const API_PUBLIC = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Private API (Authorization required)
export const API_PRIVATE = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto add token for private requests only
API_PRIVATE.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
