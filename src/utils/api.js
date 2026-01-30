// src/utils/api.js
 "use client";
import axios from "axios";

const BASE_URL = "https://dr-vehicle-backend.onrender.com";

// ✅ Public API (no token needed)
export const API_PUBLIC = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Private API (token needed)
export const API_PRIVATE = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Auto attach token for private API
API_PRIVATE.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ Backward compatible export (old code uses API)
export const API = API_PRIVATE;
