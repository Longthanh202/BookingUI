
import { useQuery } from "@tanstack/react-query";
import { FilterHotels } from "../api/khachsan/khachsan.api";
import { HotelFilterParams } from "../types/khachsan/KhachSan.types";

export const useFilterHotels = (dto: HotelFilterParams) => {
  return useQuery({
    queryKey: ["filterHotels", dto],
    queryFn: () => FilterHotels(dto),
    staleTime: 1000 * 60 * 10,
  });
};
