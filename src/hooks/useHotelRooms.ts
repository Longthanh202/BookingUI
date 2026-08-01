import { useQuery } from "@tanstack/react-query";
import { getHotelRooms } from "../api/loaiphong/loaiphong.api";
import { RoomSearchRequest } from "../types/loaiphong/RoomSearchRequest";


export const useHotelRooms = (
  request: RoomSearchRequest,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [
      "hotel-room",
      request.hotelId,
      request.soKhach,
      request.ngayNhan,
      request.ngayTra,
    ],
    queryFn: () =>
      getHotelRooms(
        request.hotelId,
        request.soKhach,
        request.ngayNhan,
        request.ngayTra
      ),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};