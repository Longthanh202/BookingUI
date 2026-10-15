import api from "../axiosInstance";
import { RoomResponse } from "../../types/loaiphong/RoomResponse";

export const getHotelRooms = async (
  khachSanId: string,
  soKhach: number,
  ngayNhan: string,
  ngayTra: string
): Promise<RoomResponse[]> => {
  const response = await api.post<RoomResponse[]>(
    "/api/room-types/by-hotel",
    {
      khachSanId,
      soKhach,
      ngayNhan: new Date(`${ngayNhan}T00:00:00.000Z`).toISOString(),
      ngayTra: new Date(`${ngayTra}T00:00:00.000Z`).toISOString(),
    }
  );

  return response.data;
};

export const getOwnerRoomTypes = async (khachSanId: string): Promise<RoomResponse[]> => {
  const response = await api.get<RoomResponse[] | { data?: RoomResponse[] }>("/api/room-types/owner", {
    params: { khachSanId },
  });
  const roomTypes = Array.isArray(response.data)
    ? response.data
    : response.data.data;
  if (!Array.isArray(roomTypes)) {
    throw new Error("Danh sách loại phòng trả về không hợp lệ.");
  }
  return roomTypes;
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
    "/api/room-types",
    payload
  );

  return response.data;
};