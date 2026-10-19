import api from "../axiosInstance";
import { OwnerRegisterRequest, RegisterRequest } from "../../types/auth/RegisterRequest";

export interface UserProfile {
  fullName: string;
  roleId: string;
  roleName: "Admin" | "Owner" | "Customer";
}

export const googleLoginApi = async (idToken: string) => {
    const res = await api.post("/api/auth/google-login", { idToken });
    return res.data;
}

export const loginApi = async (username: string, password: string) => {
    const res = await api.post("/api/users/login", { username, password });
    return res.data;
}

export const getProfileApi = async (): Promise<UserProfile> =>
    (await api.get<UserProfile>("/api/users/me")).data;

export const registerCustomer = async (input: RegisterRequest): Promise<{ message: string }> =>
    (await api.post<{ message: string }>("/api/users/register", input)).data;

export const registerOwner = async (input: OwnerRegisterRequest): Promise<void> => {
    await api.post("/api/users/register-owner", input);
};

export const refreshTokenApi = async () => (await api.post("/api/users/refresh-token")).data;

export const forgotPassword = async (username: string) =>
    (await api.post("/api/users/forgot-password", { username })).data;

export const resetPassword = async (payload: { username: string; code: string; newPassword: string }) =>
    (await api.post("/api/users/reset-password", payload)).data;