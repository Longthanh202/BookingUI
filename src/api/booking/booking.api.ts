import api from "../axiosInstance";
import { Booking } from "../../types/booking/Booking";
import { BookingRequest } from "../../types/booking/BookingRequest";

export const createBooking = async (payload: BookingRequest) => {
  return api.post("/api/DatPhong/tao", payload).then((res) => res.data);
};

export const getBookingsByUser = (userId: string | number) => {
  return api.get(`/bookings?userId=${userId}`).then((res) => res.data);
};

export const getAllBookingsHistory = (
  pageIndex: number,
  pageSize: number
) => {
  return api
    .post(
      `/api/DatPhong/booking-history?pageIndex=${pageIndex}&pageSize=${pageSize}`
    )
    .then((res) => res.data);
};

export const getBookingById = (id: string | number) => {
  return api.get(`/bookings/${id}`).then((res) => res.data);
};

export const getOwnerBookings = (payload: { khachSanId: string; page: number; pageSize: number }) => {
  // backend API lives under /api prefix
  return api.post(`/api/DatPhong/owner-bookings`, payload).then((res) => res.data);
};

export const checkInBooking = async (id: string) => {
  const response = await api.put(
    `/api/DatPhong/${id}/check-in`
  );

  return response.data;
};

export const checkOutBooking = async (id: string) => {
  console.log(id);
  const response = await api.put(
    `/api/DatPhong/${id}/check-out`
  );

  return response.data;
};

export const confirmBooking = async (
  id: string
) => {
  const response = await api.put(
    `/api/DatPhong/${id}/xacnhan`
  );

  return response.data;
};