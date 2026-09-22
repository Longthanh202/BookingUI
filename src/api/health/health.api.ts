import api from "../axiosInstance";

export const getHealth = async () => (await api.get("/api/home/health")).data;