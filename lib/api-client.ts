import axios from "axios";
import localforage from "localforage";
import { STORAGE_KEYS } from "@/types";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Requis pour Sanctum si on utilise les cookies, ou pour les sessions
});

// Intercepteur pour ajouter le token Bearer
apiClient.interceptors.request.use(async (config) => {
  const session = await localforage.getItem<any>(STORAGE_KEYS.CURRENT_SESSION);
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs globales (ex: 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optionnel : trigger un logout global si le token est invalide
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
