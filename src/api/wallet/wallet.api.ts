import api from "../axiosInstance";

export const getOwnerWallet = async () => (await api.get("/api/wallet/owner")).data;