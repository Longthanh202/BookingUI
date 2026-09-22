import api from "../axiosInstance";
import { Booking } from "../../types/booking/Booking";
import { BookingRequest } from "../../types/booking/BookingRequest";

export const createBooking = async (payload: BookingRequest) => {
  return api.post("/api/bookings", payload).then((res) => res.data);
};

export const getBookingsByUser = (userId: string | number) => {
  return api.get(`/api/bookings?userId=${userId}`).then((res) => res.data);
};

export const getAllBookingsHistory = (
  pageIndex: number,
  pageSize: number
) => {
  return api.get(`/api/bookings/history?pageIndex=${pageIndex}&pageSize=${pageSize}`)
    .then((res) => res.data);
};

export const getBookingById = (id: string | number) => {
  return api.get(`/api/bookings/${id}`).then((res) => res.data);
};

export const getOwnerBookings = (payload: { khachSanId: string; page: number; pageSize: number }) => {
  return api.post(`/api/bookings/owner`, {
    KhachSanId: payload.khachSanId,
    Page: payload.page,
    PageSize: payload.pageSize,
  }).then((res) => res.data);
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

export const getOwnerAllBookings = (payload: { Page?: number; PageSize?: number }) =>
  api.post("/api/bookings/owner/all", payload).then((res) => res.data);

export const getOwnerBookingStatistics = (payload: { HotelId: string; StartDate: string; EndDate: string; Status?: string }) =>
  api.post("/api/bookings/owner/statistics", payload).then((res) => res.data);