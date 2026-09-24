import api from "../axiosInstance";

export interface AdvertisingOrderRequest { khachSanId: string; goiQuangCaoId: number; }
export const getAdvertisingPackages = async () => (await api.get("/api/advertising/packages")).data;
export const getOwnerAdvertising = async () => (await api.get("/api/advertising/owner")).data;
export const createAdvertisingOrder = async (payload: AdvertisingOrderRequest) => (await api.post("/api/advertising/orders", payload)).data;
export const confirmAdvertisingPayment = async (id: string) => (await api.put(`/api/advertising/orders/${id}/confirm-payment`)).data;
export const getPendingAdvertising = async () => (await api.get("/api/advertising/admin/pending")).data;
export const approveAdvertising = async (id: string, approved: boolean, lyDo?: string) => (await api.put(`/api/advertising/admin/${id}/approve`, { approved, lyDo: lyDo || null })).data;