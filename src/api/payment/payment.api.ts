import api from "../axiosInstance";

export const getPayment = async (id: string) => (await api.get(`/api/payments/${id}`)).data;
export const getAdminPayments = async () => (await api.get("/api/payments/admin")).data;
export const updatePaymentStatus = async (id: string, trangThai: string) =>
  (await api.put(`/api/payments/admin/${id}/status`, { trangThai })).data;