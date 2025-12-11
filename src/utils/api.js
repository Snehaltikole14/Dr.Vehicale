"use client"; // <-- IMPORTANT

import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:8080",
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // ensure browser
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
