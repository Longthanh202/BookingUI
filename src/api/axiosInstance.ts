import axios, { InternalAxiosRequestConfig } from "axios";

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:5295";
const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async () => {
  const response = await axios.post<string | { token?: string }>(
    `${baseURL}/api/users/refresh-token`,
    undefined,
  );
  const token = typeof response.data === "string" ? response.data : response.data?.token;
  if (!token?.trim()) {
    throw new Error("Refresh-token response did not contain an access token.");
  }
  return token.trim();
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;
    const isRefreshRequest = String(originalRequest?.url || "").includes("/api/users/refresh-token");
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshRequest ||
      !localStorage.getItem("accessToken")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    if (!refreshPromise) refreshPromise = refreshAccessToken();
    const activeRefresh = refreshPromise;

    try {
      const token = await activeRefresh;
      localStorage.setItem("accessToken", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      const loginPath = window.location.pathname.startsWith("/owner")
        ? "/owner/login"
        : window.location.pathname.startsWith("/admin")
          ? "/login"
          : "/customer-login";
      if (window.location.pathname !== loginPath) window.location.href = loginPath;
      return Promise.reject(refreshError);
    } finally {
      if (refreshPromise === activeRefresh) refreshPromise = null;
    }
  },
);

export default api;
