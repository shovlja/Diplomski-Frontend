// src/lib/http.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const RAW_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000";
const BASE = RAW_BASE.replace(/\/+$/, ""); // skini završne '/'

const API_PREFIX =
  ((import.meta.env.VITE_API_PREFIX as string | undefined) ?? "/api/v1").replace(/\/+$/, "");

const TOKEN_KEY = "pmhub_token";

export const http = axios.create({
  baseURL: BASE,
  withCredentials: false, // koristimo Bearer token, ne cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
});

/** Podesi/detry default Authorization header */
export function setAuthHeader(token: string | null) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}

/** Request interceptor: doda prefix + Authorization iz localStorage */
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // 1) Prefix /api/vX samo za RELATIVNE rute i ako već nije prefiksirano
  if (config.url && !/^https?:\/\//i.test(config.url)) {
    const alreadyPrefixed =
      config.url === API_PREFIX ||
      config.url.startsWith(`${API_PREFIX}/`);

    if (!alreadyPrefixed) {
      const needsSlash = !config.url.startsWith("/");
      config.url = `${API_PREFIX}${needsSlash ? "/" : ""}${config.url}`;
    }
  }

  // 2) Authorization header iz localStorage (ako nije već postavljen ručno)
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !config.headers?.Authorization) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
  } catch {
    /* ignore */
  }

  return config;
});

/** Response interceptor: mapira FastAPI detail i globalno rešava 401 */
http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      error.message = detail;
    }

    if (status === 401) {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore storage issues */
      }
      delete http.defaults.headers.common.Authorization;

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

// Bootstrap default Authorization pri load-u
try {
  const bootToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (bootToken) setAuthHeader(bootToken);
} catch {
  /* ignore */
}

// (opciono) izvoz prefiksa, ako zatreba
export const apiPrefix = API_PREFIX;
