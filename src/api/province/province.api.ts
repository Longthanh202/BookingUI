import api from "../axiosInstance";

export const getProvinces = async () => (await api.get("/api/provinces")).data;