import { useQuery } from "@tanstack/react-query";
import {
  GetDanhSachKhachSanOwner,
  getHotelDetailById,
} from "../api/khachsan/khachsan.api";
import { KhachSanListOwnerParams } from "../types/khachsan/KhachSan.types";
import { getTags } from "../api/home/home.api";
import {
  getOwnerBookingCustomers,
  getBookingStatusOptions,
  getOwnerAllBookings,
  getBooking,
  getOwnerBookings,
} from "../api/booking/booking.api";
import {
  getOwnerRoomTypes,
} from "../api/loaiphong/loaiphong.api";
import { getRoomsByRoomType, getRoomPrices } from "../api/room/room.api";
import { getOwnerPromotions } from "../api/promotion/promotion.api";
import {
  getBankAccounts,
  getFinanceStatement,
  getOwnerWallets,
  getWithdrawals,
} from "../api/finance/finance.api";
import { getOwnerHotelReviews } from "../api/review/review.api";
import { getOwnerRevenueReport, getOwnerCalendar, getOwnerDashboard } from "../api/owner.api";
import { getAdvertisingPackages, getOwnerAdvertising } from "../api/advertising/advertising.api";
import { GetHoaHongOwner } from "../api/hoahong/hoahong.api";

export interface OwnerTagOption {
  id: string;
  name: string;
}

const responseRows = (value: any): any[] => {
  const data = value?.data ?? value;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeTags = (value: unknown): OwnerTagOption[] => {
  if (value === undefined || value === null) return [];
  const source = Array.isArray(value)
    ? value
    : value && typeof value === "object" && "data" in value && Array.isArray(value.data)
      ? value.data
      : value && typeof value === "object" && "items" in value && Array.isArray(value.items)
        ? value.items
        : null;
  if (!source) throw new Error("Danh sách tag trả về không hợp lệ.");

  return source.flatMap((item): OwnerTagOption[] => {
    if (!item || typeof item !== "object") return [];
    const tag = item as Record<string, unknown>;
    const id = tag.id ?? tag.Id ?? tag.tagId ?? tag.TagId;
    const name = tag.name ?? tag.Name ?? tag.tagName ?? tag.TagName;
    return typeof id === "string" && typeof name === "string" ? [{ id, name }] : [];
  });
};

export const useOwnerHotels = () =>
  useQuery({
    queryKey: ["owner-hotels"],
    queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }),
  });

export const useOwnerHotelPage = (params: KhachSanListOwnerParams) =>
  useQuery({
    queryKey: ["KhachSanOwner", params.Page],
    queryFn: () => GetDanhSachKhachSanOwner(params),
  });

export const useOwnerHotelTags = () =>
  useQuery<OwnerTagOption[]>({
    queryKey: ["hotel-tags"],
    queryFn: async () => normalizeTags(await getTags()),
    staleTime: 5 * 60 * 1000,
  });

export const useOwnerHotelDetail = <TData = unknown>(hotelId: string | undefined) =>
  useQuery<TData>({
    queryKey: ["hotelDetailOwner", hotelId],
    queryFn: () => getHotelDetailById(hotelId ?? ""),
    enabled: Boolean(hotelId),
    retry: false,
  });

export const useOwnerRoomTypes = (hotelId: string) =>
  useQuery({
    queryKey: ["owner-room-types", hotelId],
    queryFn: () => getOwnerRoomTypes(hotelId),
    enabled: Boolean(hotelId),
  });

export const useOwnerHotelRoomTypes = (hotelId: string | undefined) =>
  useQuery({
    queryKey: ["ownerRoomTypes", hotelId],
    queryFn: () => getOwnerRoomTypes(hotelId ?? ""),
    enabled: Boolean(hotelId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useOwnerHotelBookings = (hotelId: string | undefined) =>
  useQuery({
    queryKey: ["hotelBookings", hotelId],
    queryFn: () => getOwnerBookings({ khachSanId: hotelId ?? "", page: 1, pageSize: 10 }),
    enabled: Boolean(hotelId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useOwnerRooms = (roomTypeId: string) =>
  useQuery({
    queryKey: ["owner-rooms", roomTypeId],
    queryFn: () => getRoomsByRoomType(roomTypeId),
    enabled: Boolean(roomTypeId),
  });

export const useOwnerRoomPrices = (roomTypeId: string) =>
  useQuery({
    queryKey: ["room-prices", roomTypeId],
    queryFn: () => getRoomPrices(roomTypeId),
    enabled: Boolean(roomTypeId),
  });

export const useOwnerPromotions = (hotelId: string) =>
  useQuery({
    queryKey: ["owner-promotions", hotelId],
    queryFn: () => getOwnerPromotions(hotelId),
    enabled: Boolean(hotelId),
  });

export const useOwnerWallets = () =>
  useQuery({ queryKey: ["owner-wallets"], queryFn: getOwnerWallets });

export const useOwnerBankAccounts = () =>
  useQuery({ queryKey: ["bank-accounts"], queryFn: getBankAccounts });

export const useOwnerWithdrawals = () =>
  useQuery({ queryKey: ["withdrawals"], queryFn: getWithdrawals });

export const useOwnerFinanceStatement = (from: string | undefined, to: string | undefined, hotelId: string) =>
  useQuery({
    queryKey: ["owner-statement", from, to, hotelId],
    queryFn: () => getFinanceStatement({ khachSanId: hotelId || undefined, from, to }),
  });

export const useOwnerReviews = (hotelId: string) =>
  useQuery({
    queryKey: ["owner-reviews", hotelId],
    queryFn: () => getOwnerHotelReviews(hotelId),
    enabled: Boolean(hotelId),
  });

export const useOwnerRevenueReport = (
  params: Parameters<typeof getOwnerRevenueReport>[0],
  enabled: boolean
) =>
  useQuery({
    queryKey: ["owner-revenue-report", params],
    queryFn: () => getOwnerRevenueReport(params),
    enabled,
  });

export const useOwnerDashboard = () =>
  useQuery({ queryKey: ["owner-dashboard"], queryFn: () => getOwnerDashboard() });

export const useOwnerBookings = (
  hotelId: string,
  customerId: string,
  status: string,
  createdDate: string,
  search: string,
  page: number
) =>
  useQuery({
    queryKey: ["owner-all-bookings", hotelId, customerId, status, createdDate, search, page],
    queryFn: () => getOwnerAllBookings({
      hotelId: hotelId || null,
      customerId: customerId || null,
      trangThai: status,
      ngayTao: createdDate ? new Date(`${createdDate}T00:00:00.000Z`).toISOString() : null,
      maDatPhong: search.trim() || null,
      page,
      pageSize: 10,
    }),
    refetchOnMount: "always",
  });

export const useOwnerCustomers = (hotelId: string) =>
  useQuery({
    queryKey: ["owner-booking-customers", hotelId],
    queryFn: () => getOwnerBookingCustomers(hotelId),
    enabled: Boolean(hotelId),
  });

export const useOwnerCustomersForHotels = (hotelIds: string[], enabled: boolean) =>
  useQuery({
    queryKey: ["owner-booking-customers-by-hotels", hotelIds.join(",")],
    queryFn: async () => {
      const customerLists = await Promise.all(hotelIds.map((id) => getOwnerBookingCustomers(id)));
      const uniqueCustomers = new Map<string, any>();
      customerLists.flatMap(responseRows).forEach((customer) => {
        const id = String(customer?.id ?? customer?.Id ?? customer?.customerId ?? customer?.CustomerId ?? customer?.khachHangId ?? customer?.KhachHangId ?? "-");
        if (id !== "-") uniqueCustomers.set(id, customer);
      });
      return Array.from(uniqueCustomers.values());
    },
    enabled,
  });

export const useOwnerBookingStatuses = () =>
  useQuery({ queryKey: ["booking-status-options"], queryFn: getBookingStatusOptions });

export const useOwnerBookingDetails = (bookingId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ["owner-calendar-booking-details", bookingId],
    queryFn: () => getBooking(bookingId!),
    enabled: Boolean(bookingId) && enabled,
  });

export const useOwnerAdvertisingPackages = () =>
  useQuery({ queryKey: ["advertising-packages"], queryFn: getAdvertisingPackages });

export const useOwnerAdvertising = () =>
  useQuery({ queryKey: ["advertising-owner"], queryFn: getOwnerAdvertising });

export const useOwnerCommissions = () =>
  useQuery({ queryKey: ["hoaHongOwner"], queryFn: GetHoaHongOwner });

export const useOwnerCalendarHotels = () =>
  useQuery({
    queryKey: ["owner-calendar-hotels"],
    queryFn: async () => {
      const pageSize = 100;
      const firstPage = await GetDanhSachKhachSanOwner({ Page: 1, PageSize: pageSize });
      const totalPages = Number(firstPage?.totalPage ?? firstPage?.data?.totalPage ?? 1);
      if (totalPages <= 1) return firstPage;
      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          GetDanhSachKhachSanOwner({ Page: index + 2, PageSize: pageSize })
        )
      );
      const allHotels = [firstPage, ...remainingPages].flatMap(responseRows);
      if (Array.isArray(firstPage)) return allHotels;
      if (Array.isArray(firstPage?.data)) {
        return { ...firstPage, data: allHotels, totalRow: firstPage.totalRow ?? allHotels.length };
      }
      return firstPage;
    },
  });

export const useOwnerCalendar = (
  ownerHotels: any[],
  hotelIds: string[],
  from: string,
  to: string,
  enabled: boolean
) =>
  useQuery({
    queryKey: ["owner-calendar", hotelIds.join(","), from, to],
    queryFn: async () => {
      const calendars = await Promise.all(ownerHotels.map(async (hotel: any) => {
        const id = String(hotel?.id ?? hotel?.Id ?? hotel?.khachSanId ?? hotel?.KhachSanId);
        const data = await getOwnerCalendar(id, from, to);
        const payload = data?.data ?? data ?? {};
        const readRows = (value: any) => {
          if (Array.isArray(value)) return value;
          if (Array.isArray(value?.items)) return value.items;
          if (Array.isArray(value?.results)) return value.results;
          if (Array.isArray(value?.data)) return value.data;
          return [];
        };
        const getValue = (source: any, ...keys: string[]) =>
          keys.map((key) => source?.[key] ?? source?.[key.charAt(0).toUpperCase() + key.slice(1)])
            .find((value) => value !== undefined && value !== null);
        const hotelName = getValue(hotel, "tenKhachSan", "name") ?? "Khách sạn";
        return {
          rooms: readRows(getValue(payload, "rooms", "phongs", "roomList")).map((room: any) => ({ ...room, _hotelId: id, _hotelName: hotelName })),
          bookings: readRows(getValue(payload, "bookings", "datPhongs", "reservations")).map((booking: any) => ({ ...booking, _hotelId: id, _hotelName: hotelName })),
          blocks: readRows(getValue(payload, "blocks", "availabilityBlocks", "blockedPeriods", "khoangChan")).map((block: any) => ({ ...block, _hotelId: id, _hotelName: hotelName })),
        };
      }));
      return {
        rooms: calendars.flatMap((item) => item.rooms),
        bookings: calendars.flatMap((item) => item.bookings),
        blocks: calendars.flatMap((item) => item.blocks),
      };
    },
    enabled,
  });
