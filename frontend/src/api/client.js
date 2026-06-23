import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://terralink-ousa.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("terralink-auth");
  if (stored) {
    try {
      const token = JSON.parse(stored)?.state?.access;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      localStorage.removeItem("terralink-auth");
    }
  }
  return config;
});

export function toList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export function getErrorMessage(error) {
  if (error?.code === "ECONNABORTED") {
    return "The server is taking too long to respond. Please try again in a moment.";
  }
  if (error?.message === "Network Error" && !error?.response) {
    return "Cannot reach the TerraLink server. Please check the API domain and allowed origins.";
  }
  const data = error?.response?.data;
  if (!data) return error?.message || "Something went wrong.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const firstKey = Object.keys(data)[0];
  const value = data[firstKey];
  if (Array.isArray(value)) return `${firstKey}: ${value[0]}`;
  if (typeof value === "string") return `${firstKey}: ${value}`;
  return "Please check the highlighted fields.";
}
