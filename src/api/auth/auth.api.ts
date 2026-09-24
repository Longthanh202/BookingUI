import api from "../axiosInstance";
import {RegisterRequest} from "../../types/auth/RegisterRequest";

export const googleLoginApi = async (idToken: string) => {
    const res = await api.post("/api/auth/google-login", { idToken });
    return res.data;
}

export const loginApi = async (username: string, password: string) => {
    const res = await api.post("/api/users/login", { username, password });
    return res.data;
}

export const getProfileApi = async () => {
    const res = await api.get("/api/users/me");
    return res.data;
}

export const registerCustomer = async(input: RegisterRequest) =>{
    const res = await api.post("/api/users/register", input);
    return res.data;
}

export const refreshTokenApi = async () => (await api.post("/api/users/refresh-token")).data;

export const setRolePermissions = async (payload: { roleId: string; permissions: unknown[] }) =>
    (await api.post("/api/users/role-permissions", payload)).data;

export const forgotPassword = async (username: string) =>
    (await api.post("/api/users/forgot-password", { username })).data;

export const resetPassword = async (payload: { username: string; code: string; newPassword: string }) =>
    (await api.post("/api/users/reset-password", payload)).data;