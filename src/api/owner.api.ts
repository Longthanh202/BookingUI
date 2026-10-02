import api from "./axiosInstance";

export const getOwnerDashboard = async (hotelId?: string) =>
  (await api.get("/api/owner/dashboard", { params: hotelId ? { hotelId } : undefined })).data;

export const getOwnerRevenueReport = async (params: { from: string; to: string; groupBy: "day" | "month" | "year"; hotelId?: string }) =>
  (await api.get("/api/owner/reports/revenue", { params })).data;

export const getOwnerCalendar = async (hotelId: string, from: string, to: string) =>
  (await api.get("/api/owner/calendar", { params: { hotelId, from, to } })).data;

export const createAvailabilityBlock = async (roomId: string, payload: { startAt: string; endAt: string; reason: string }) =>
  (await api.post(`/api/owner/rooms/${roomId}/availability-blocks`, payload)).data;

export const deleteAvailabilityBlock = async (blockId: string) =>
  (await api.delete(`/api/owner/availability-blocks/${blockId}`)).data;