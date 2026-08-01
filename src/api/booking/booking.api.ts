import api from "../axiosInstance";
import { Booking } from "../../types/booking/Booking";

export const createBooking = (payload: Booking) => {
  return api.post("/bookings", payload).then((res) => res.data);
};

export const getBookingsByUser = (userId: string | number) => {
  return api.get(`/bookings?userId=${userId}`).then((res) => res.data);
};

export const getAllBookings = () => {
  return api.get(`/bookings`).then((res) => res.data);
};

export const getBookingById = (id: string | number) => {
  return api.get(`/bookings/${id}`).then((res) => res.data);
};
