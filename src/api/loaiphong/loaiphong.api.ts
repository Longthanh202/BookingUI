import api from "../axiosInstance";
import { RoomResponse } from "../../types/loaiphong/RoomResponse";

export const getHotelRooms = async (
  khachSanId: string,
  soKhach: number,
  ngayNhan: string,
  ngayTra: string
): Promise<RoomResponse[]> => {
  const response = await api.post<RoomResponse[]>(
    "/api/LoaiPhong/get/hotelId",
    {
      khachSanId,
      soKhach,
      ngayNhan,
      ngayTra,
    }
  );

  return response.data;
};

export const getOwnerRoomTypes = async (khachSanId: string): Promise<RoomResponse[]> => {
  console.log("getOwnerRoomTypes called with khachSanId:", khachSanId);
  // backend expects the raw id in the request body (same pattern as other endpoints)
  const response = await api.post<RoomResponse[]>(
    "/api/LoaiPhong/owner/loai-phong",
    khachSanId
  );
  console.log("getOwnerRoomTypes response:", response.data);
  return response.data;
};

export const createRoomTypes = async (
  payload: Array<{
    khachSanId: string;
    tenLoaiPhong: string;
    soKhachToiDa: number;
    kieuGiuong: string;
    moTa: string;
  }>
) => {
  const response = await api.post(
    "/api/LoaiPhong/tao",
    payload
  );

  return response.data;
};