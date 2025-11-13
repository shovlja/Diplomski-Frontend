// src/lib/http.ts
import axios, { AxiosHeaders, type RawAxiosRequestHeaders } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  withCredentials: false,
});

if (import.meta.env.DEV) {
  api.interceptors.request.use((cfg) => {
    // vidi finalni URL koji FE gađa
    console.log(
      "[HTTP]",
      cfg.method?.toUpperCase(),
      (cfg.baseURL ?? "") + (cfg.url ?? "")
    );
    return cfg;
  });
}

// Helper: uveri se da su defaults.common headeri AxiosHeaders (bez partial objekata)
function asAxiosHeaders(h: unknown): AxiosHeaders {
  if (h instanceof AxiosHeaders) return h;
  const ah = new AxiosHeaders();
  if (h && typeof h === "object") {
    for (const [k, v] of Object.entries(h as RawAxiosRequestHeaders)) {
      if (v !== undefined) ah.set(k, v);
    }
  }
  return ah;
}

/** Jedino ovde diramo headere – samo Authorization. */
export function setAuthHeader(token: string | null) {
  const common = asAxiosHeaders(api.defaults.headers.common);
  if (token) common.set("Authorization", `Bearer ${token}`);
  else common.delete("Authorization");
  api.defaults.headers.common = common; // čuva AxiosHeaders instancu
}

export default api;
