import { useQuery } from "@tanstack/react-query";
import { getHotelRooms } from "../api/loaiphong/loaiphong.api";
import { RoomSearchRequest } from "../types/loaiphong/RoomSearchRequest";


export const useHotelRooms = (
  request: RoomSearchRequest
) => {
  const validDates = Boolean(
    request.hotelId &&
    request.soKhach > 0 &&
    request.ngayNhan &&
    request.ngayTra &&
    request.ngayTra > request.ngayNhan
  );

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
    enabled: validDates,
    staleTime: 1000 * 60 * 5,
  });
};