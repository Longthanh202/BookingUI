import api from "../axiosInstance";
import { HotelFilterParams, KhachSanListOwnerParams, KhachSanListParams } from "../../types/khachsan/KhachSan.types";
import { KhachSan } from "../../types/khachsan/KhachSan";

const toHotelSearchParams = (dto: HotelFilterParams | KhachSanListParams) => ({
  keyword: dto.Keyword,
  thanhPho: dto.ThanhPho,
  viDo: dto.ViDo,
  kinhDo: dto.KinhDo,
  soSao: dto.SoSao,
  trangThai: dto.TrangThai,
  soKhach: "SoKhach" in dto ? dto.SoKhach : undefined,
  ngayNhanPhong: "NgayNhanPhong" in dto ? dto.NgayNhanPhong : undefined,
  ngayTraPhong: "NgayTraPhong" in dto ? dto.NgayTraPhong : undefined,
  page: dto.Page,
  pageSize: dto.PageSize,
});

export const GetDanhSachKhachSanOwner = async (dto: KhachSanListOwnerParams) => {
  const res = await api.get("/api/hotels/owner/search", {
    params: { page: dto.Page, pageSize: dto.PageSize },
  });
  return res.data;
};

export const searchHotelsAdmin = async (dto: Record<string, unknown>) => {
  const res = await api.get("/api/hotels/admin/search", { params: dto });
  return res.data;
};

export const ThemKhachSan = async (dto: KhachSan | FormData) => {
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

export const CapNhatKhachSan = async (dto: KhachSan | FormData) => {
  const res = await api.put("/api/hotels", dto);
  return res.data;
};

export const XoaKhachSan = async (id: string) => {
  const res = await api.delete(`/api/hotels/${id}`);
  return res.data;
};

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
