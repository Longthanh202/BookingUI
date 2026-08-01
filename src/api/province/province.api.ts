import api from "../axiosInstance";

export const fetchProvinces = async () => {
    const res = await api.get("/api/Province/get");
    return res.data;
};       