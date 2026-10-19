import { useQueries, useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../api/auth/auth.api";
import { getAllBookingsHistory, getBooking } from "../api/booking/booking.api";
import { getPayment } from "../api/payment/payment.api";
import { getMyReviews } from "../api/review/review.api";
import {
  FilterKhachSan,
  getBanners,
  getDestinations,
  getHotelsByTag,
  getTags,
} from "../api/home/home.api";
import { getProvinces } from "../api/province/province.api";
import { getHotelDetailById } from "../api/khachsan/khachsan.api";
import { HotelFilterParams } from "../types/khachsan/KhachSan.types";

export const useCustomerHomeTags = () =>
  useQuery({
    queryKey: ["stayro-public-tags"],
    queryFn: getTags,
    staleTime: 5 * 60 * 1000,
  });

export const useCustomerHomeHotels = (filter: HotelFilterParams) =>
  useQuery({
    queryKey: ["stayro-home-hotels", filter],
    queryFn: () => FilterKhachSan(filter),
    staleTime: 5 * 60 * 1000,
  });

export const useCustomerBanners = () =>
  useQuery({
    queryKey: ["stayro-active-banners"],
    queryFn: getBanners,
    staleTime: 5 * 60 * 1000,
  });

export const useCustomerProvinces = () =>
  useQuery({
    queryKey: ["stayro-provinces"],
    queryFn: getProvinces,
    staleTime: 60 * 60 * 1000,
  });

export const useCustomerTaggedHotels = (slug: string | undefined) =>
  useQuery({
    queryKey: ["stayro-tag-hotels", slug],
    queryFn: () => getHotelsByTag(slug || ""),
    enabled: Boolean(slug),
  });

export const usePopularTags = () =>
  useQuery<any[]>({ queryKey: ["homeTags"], queryFn: getTags });

export const usePopularDestinations = (selectedTag: string | null) =>
  useQuery<any[]>({
    queryKey: ["homeDestinations", selectedTag || "all"],
    queryFn: () => getDestinations(selectedTag ?? undefined),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

export const useHotelList = (filter: HotelFilterParams) =>
  useQuery<any>({
    queryKey: ["homeRooms", filter],
    queryFn: () => FilterKhachSan(filter),
    staleTime: 5 * 60 * 1000,
  });

export const useCustomerHotelDetail = (hotelId: string | undefined) =>
  useQuery({
    queryKey: ["hotelDetail", hotelId],
    queryFn: () => getHotelDetailById(hotelId ?? ""),
    enabled: Boolean(hotelId),
    retry: false,
  });

export const useCustomerProfile = (enabled: boolean) =>
  useQuery({ queryKey: ["customer-profile"], queryFn: getProfileApi, enabled });

export const useCustomerBookings = (page: number, pageSize: number, bookingCode: string) =>
  useQuery({
    queryKey: ["bookings-history", page, pageSize, bookingCode],
    queryFn: () => getAllBookingsHistory(page, pageSize, bookingCode),
  });

export const useCustomerAccountBookings = (enabled: boolean) =>
  useQuery({
    queryKey: ["bookings-history", 1, 50],
    queryFn: () => getAllBookingsHistory(1, 50),
    enabled,
  });

export const useCustomerReviews = (enabled: boolean) =>
  useQuery({ queryKey: ["customer-reviews"], queryFn: getMyReviews, enabled });

export const useCustomerPaymentDetails = (paymentIds: string[], enabled: boolean) =>
  useQueries({
    queries: paymentIds.map((paymentId) => ({
      queryKey: ["customer-payment", paymentId],
      queryFn: () => getPayment(paymentId),
      enabled,
    })),
  });

export const useCustomerBookingDetail = (bookingId: string | undefined) =>
  useQuery({
    queryKey: ["booking-detail", bookingId],
    queryFn: () => getBooking(bookingId!),
    enabled: Boolean(bookingId),
  });
