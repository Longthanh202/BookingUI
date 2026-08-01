import { useQuery } from "@tanstack/react-query";
import { fetchProvinces } from "../api/province/province.api";

export const useProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 10
  });
};