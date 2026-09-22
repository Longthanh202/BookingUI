import api from "../axiosInstance";
import { HotelFilterParams, KhachSanListOwnerParams, KhachSanListParams } from "../../types/khachsan/KhachSan.types";
import { KhachSan } from "../../types/khachsan/KhachSan";

export const GetDanhSachKhachSanOwner = async (dto: KhachSanListOwnerParams) => {
  const res = await api.post("/api/hotels/owner/search", dto);
  return res.data;
};

export const searchHotelsAdmin = async (dto: Record<string, unknown>) => {
  const res = await api.post("/api/hotels/admin/search", dto);
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

export const FilterHotels = async (dto: HotelFilterParams) => {
  const res = await api.post(`/api/hotels/search`, dto);
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
    console.error("Lỗi khi tải chi tiết khách sạn:", error);
    throw error;
  }
};
