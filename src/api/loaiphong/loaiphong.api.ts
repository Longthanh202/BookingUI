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
      ngayNhan,
      ngayTra,
    }
  );

  return response.data;
};

export const getOwnerRoomTypes = async (khachSanId: string): Promise<RoomResponse[]> => {
  const response = await api.post<RoomResponse[]>(
    "/api/room-types/owner",
    khachSanId
  );
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
    "/api/room-types",
    payload
  );

  return response.data;
};