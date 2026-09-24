import api from "../axiosInstance";
import { BookingRequest } from "../../types/booking/BookingRequest";

export const createBooking = async (payload: BookingRequest) => {
  return api.post("/api/bookings", payload).then((res) => res.data);
};

export const getAllBookingsHistory = (
  pageIndex: number,
  pageSize: number
) => {
  return api.get("/api/bookings/history", { params: { pageIndex, pageSize } })
    .then((res) => res.data);
};

export const getOwnerBookings = (payload: { khachSanId: string; page: number; pageSize: number }) => {
  return api.post("/api/bookings/owner", payload).then((res) => res.data);
};

export const checkInBooking = async (id: string) => {
  const response = await api.put(
    `/api/bookings/${id}/check-in`
  );

  return response.data;
};

export const checkOutBooking = async (id: string) => {
  const response = await api.put(
    `/api/bookings/${id}/check-out`
  );

  return response.data;
};

export const confirmBooking = async (
  id: string
) => {
  const response = await api.put(
    `/api/bookings/${id}/confirm`
  );

  return response.data;
};

export const getOwnerAllBookings = (payload: { page?: number; pageSize?: number }) =>
  api.post("/api/bookings/owner/all", payload).then((res) => res.data);

export const getOwnerBookingStatistics = (payload: { hotelId: string; startDate: string; endDate: string; status?: string }) =>
  api.post("/api/bookings/owner/statistics", payload).then((res) => res.data);

export const getBooking = async (id: string) => (await api.get(`/api/bookings/${id}`)).data;

export const cancelBooking = async (id: string) =>
  (await api.put(`/api/bookings/${id}/cancel`)).data;

export interface AdminBookingSearchRequest {
  hotelId?: string;
  customerId?: string;
  trangThai?: string;
  ngayTao?: string;
  page?: number;
  pageSize?: number;
}

export const searchBookingsAdmin = async (payload: AdminBookingSearchRequest) =>
  (await api.post("/api/bookings/admin/search", payload)).data;