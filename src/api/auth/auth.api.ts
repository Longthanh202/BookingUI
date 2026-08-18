import api from "../axiosInstance";
import {RegisterRequest} from "../../types/auth/RegisterRequest";

export const loginApi = async (username: string, password: string) => {
    const res = await api.post("/api/User/login", {username, password});
    return res.data;
}

export const getProfileApi = async () => {
    const res = await api.get("/api/User/me");
    return res.data;
}

export const registerCustomer = async(input: RegisterRequest) =>{
    const res = await api.post("/api/User/register", input);
    return res.data;
}