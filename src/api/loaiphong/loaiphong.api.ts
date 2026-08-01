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