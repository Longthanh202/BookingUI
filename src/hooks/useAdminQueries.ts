import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../api/auth/auth.api";
import { searchBookingsAdmin, getBookingStatusOptions } from "../api/booking/booking.api";
import { getAdminPayments } from "../api/payment/payment.api";
import { getPendingCommissions } from "../api/hoahong/hoahong.api";
import { getPendingWithdrawals } from "../api/finance/finance.api";
import { getPendingAdvertising } from "../api/advertising/advertising.api";
import { getBanners } from "../api/banner/banner.api";
import { searchHotelsAdmin } from "../api/khachsan/khachsan.api";
import {
  getAdminTags,
  searchAdminUsers,
  searchOwnerRegistrations,
} from "../api/admin/admin.api";

export type AdminSection =
  | "bookings"
  | "payments"
  | "commissions"
  | "withdrawals"
  | "advertising"
  | "banners"
  | "hotels"
  | "users"
  | "reviews"
  | "tags";

export const useCurrentProfile = (enabled: boolean) =>
  useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useAdminBookingStatuses = (enabled: boolean) =>
  useQuery({
    queryKey: ["booking-status-options"],
    queryFn: getBookingStatusOptions,
    enabled,
  });

export const useAdminOperations = (section: AdminSection, filters: Record<string, string>) =>
  useQuery({
    queryKey: ["admin", section, filters],
    queryFn: () => {
      const page = Number(filters.page || 1);
      const pageSize = Number(filters.pageSize || 20);
      if (section === "bookings") {
        return searchBookingsAdmin({
          hotelId: filters.hotelId || null,
          customerId: filters.customerId || null,
          trangThai: filters.trangThai || null,
          ngayTao: filters.ngayTao ? new Date(filters.ngayTao).toISOString() : null,
          maDatPhong: filters.maDatPhong?.trim() || null,
          page,
          pageSize,
        });
      }
      if (section === "payments") return getAdminPayments();
      if (section === "commissions") return getPendingCommissions();
      if (section === "withdrawals") return getPendingWithdrawals();
      if (section === "advertising") return getPendingAdvertising();
      if (section === "banners") {
        return getBanners({
          keyword: filters.keyword || undefined,
          isActive: filters.isActive === "1" ? 1 : undefined,
          startRow: (page - 1) * pageSize,
          endRow: page * pageSize,
        });
      }
      if (section === "hotels") {
        return searchHotelsAdmin({
          keyword: filters.keyword || undefined,
          thanhPho: filters.thanhPho || undefined,
          soSao: filters.soSao ? Number(filters.soSao) : undefined,
          trangThai: filters.trangThai || undefined,
          page,
          pageSize,
        });
      }
      if (section === "users") {
        return searchAdminUsers({
          keyword: filters.keyword || undefined,
          status: filters.status === "" || filters.status === undefined ? undefined : Number(filters.status),
          page,
          pageSize,
        });
      }
      if (section === "tags") return getAdminTags();
      return Promise.resolve([]);
    },
  });

export const useAdminPendingWithdrawals = () =>
  useQuery({ queryKey: ["admin", "withdrawals"], queryFn: getPendingWithdrawals });

export const useAdminPendingAdvertising = () =>
  useQuery({ queryKey: ["admin", "advertising"], queryFn: getPendingAdvertising });

export const useAdminPendingCommissions = () =>
  useQuery({ queryKey: ["admin", "commissions"], queryFn: getPendingCommissions });

export const useAdminOwnerRegistrations = (
  status: string,
  keyword: string,
  page: number,
  pageSize: number
) =>
  useQuery({
    queryKey: ["admin", "owner-registrations", { status, keyword, page, pageSize }],
    queryFn: () => searchOwnerRegistrations({
      status: status === "" ? undefined : Number(status) as 0 | 1 | 2,
      keyword: keyword || undefined,
      page,
      pageSize,
    }),
  });
