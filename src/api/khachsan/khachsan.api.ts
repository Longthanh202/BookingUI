import api from "../axiosInstance";
import { HotelFilterParams, KhachSanListOwnerParams, KhachSanListParams } from "../../types/khachsan/KhachSan.types";

const toIsoDate = (value?: string | null) => {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`).toISOString();
  }
  return value;
};

const toHotelSearchParams = (dto: HotelFilterParams | KhachSanListParams) => ({
  keyword: dto.Keyword,
  soKhach: "SoKhach" in dto ? dto.SoKhach : undefined,
  ngayNhanPhong: "NgayNhanPhong" in dto ? toIsoDate(dto.NgayNhanPhong) : undefined,
  ngayTraPhong: "NgayTraPhong" in dto ? toIsoDate(dto.NgayTraPhong) : undefined,
  page: Math.max(1, Number(dto.Page) || 1),
  pageSize: Math.min(100, Math.max(1, Number(dto.PageSize) || 10)),
});

export const GetDanhSachKhachSanOwner = async (dto: KhachSanListOwnerParams) => {
  const res = await api.get("/api/hotels/owner/search", {
    params: { page: dto.Page, pageSize: dto.PageSize },
  });
  return res.data;
};

export const getOwnerHotelOptions = async (ownerId: string) =>
  (await api.get("/api/hotels/options", { params: { ownerId } })).data;

export interface AdminHotelSearchParams {
  keyword?: string;
  thanhPho?: string;
  soSao?: number;
  trangThai?: string;
  page?: number;
  pageSize?: number;
}

export const searchHotelsAdmin = async (dto: AdminHotelSearchParams) => {
  const res = await api.get("/api/hotels/admin/search", { params: dto });
  return res.data;
};

export const ThemKhachSan = async (dto: FormData) => {
  try {
    const res = await api.post("/api/hotels", dto, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Lỗi 400 chi tiết:", error.response.data);
    } else {
      console.error("Lỗi khác:", error.message);
    }
    throw error;
  }
};

export interface UpdateHotelRequest {
  tenKhachSan: string;
  moTa: string;
  chinhSachHuy: string;
  diaChi: string;
  thanhPho: string;
  viDo: number;
  kinhDo: number;
  soSao: number;
  gioNhanPhong: string;
  gioTraPhong: string;
  tagIds: string[];
}

export const CapNhatKhachSan = async (hotelId: string, dto: UpdateHotelRequest) => {
  const res = await api.put(`/api/hotels/owner/${hotelId}`, dto);
  return res.data;
};

export const addHotelImages = async (hotelId: string, images: File[]) => {
  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));
  return (await api.post(`/api/hotels/owner/${hotelId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })).data;
};

export const deleteHotelImage = async (hotelId: string, imageId: string | number) =>
  (await api.delete(`/api/hotels/owner/${hotelId}/images/${imageId}`)).data;

export const updateHotelStatus = async (id: string, trangThai: string) =>
  (await api.put(`/api/hotels/admin/${id}/status`, { trangThai })).data;

export const FilterHotels = async (dto: HotelFilterParams) => {
  const res = await api.get("/api/hotels/search", {
    params: toHotelSearchParams(dto),
  });
  return res.data;
};

export const getHotelDetailById = async (id: string) => {
  if (!id) {
    throw new Error("Thiếu id khách sạn");
  }

  try {
    const response = await api.get(`/api/hotels/${id}`);

    return response.data?.data ?? response.data;
  } catch (error) {
    throw error;
  }
};
