import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:5295",
    headers: {
        "Content-Type": "application/json"
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // ❗ tránh loop vô hạn
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await api.post("/api/users/refresh-token");

        const newAccessToken = res.data.token;

        localStorage.setItem("accessToken", newAccessToken);

        // update header mặc định
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        // retry request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;