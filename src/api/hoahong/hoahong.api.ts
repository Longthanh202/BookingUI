import { HoaHong } from "../../types/HoaHongs/HoaHong";
import api from "../axiosInstance";
export const GetHoaHongOwner = async () => {
  const response = await api.get<HoaHong[]>(
    "/api/commissions/owner");

  return response.data;
};

export const getPendingCommissions = async () =>
  (await api.get("/api/commissions/admin/pending")).data;