"use client";
import axios from "axios";

const BASE_URL = "https://dr-vehicle-backend.onrender.com";

export const API_PUBLIC = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const API_PRIVATE = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

API_PRIVATE.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API = API_PRIVATE;
