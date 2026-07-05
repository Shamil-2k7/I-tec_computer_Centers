import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getDeviceId } from "./deviceId";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "akm_lms_access_token";
const REFRESH_TOKEN_KEY = "akm_lms_refresh_token";

export const tokenStore = {
  getAccess: () => (typeof window === "undefined" ? null : localStorage.getItem(ACCESS_TOKEN_KEY)),
  getRefresh: () => (typeof window === "undefined" ? null : localStorage.getItem(REFRESH_TOKEN_KEY)),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["X-Device-Id"] = getDeviceId();
  return config;
});

let isRefreshing = false;
let queue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
        tokenStore.clear();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStore.getRefresh();
        if (!refreshToken) throw error;

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        tokenStore.set(accessToken, newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as any)?.message || error.message || "Something went wrong";
  }
  return "Something went wrong";
};
