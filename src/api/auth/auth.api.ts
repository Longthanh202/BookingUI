import axios from "axios";
import api from "../axiosInstance";

export const loginApi = async (username: string, password: string) => {
    const res = await api.post("/api/User/login", {username, password});
    return res.data;
}

export const getProfileApi = async () => {
    const res = await api.get("/api/User/me");
    return res.data;
}