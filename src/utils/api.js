// "use client"; // <-- IMPORTANT

// import axios from "axios";

// export const API = axios.create({
//   baseURL: "http://localhost:8080",
// });

// API.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       // ensure browser
//       const token = localStorage.getItem("token");
//       if (token) {
//         config.headers["Authorization"] = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
// utils/api.js
// src/utils/api.js
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

// ✅ Add token automatically for private calls
API_PRIVATE.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
