import axios from "axios";
import api from "../axiosInstance";
import { HotelFilterParams, KhachSanListParams } from "../../types/khachsan/KhachSan.types";

const mockApi = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getBanners = async () => {
  const res = await api.get("/api/banners/active");
  return res.data;
};

export const getDestinations = async (tag?: string) => {
  const url = tag ? `/destinations?tags_like=${encodeURIComponent(tag)}` : "/destinations";
  const res = await mockApi.get(url);
  return res.data;
};

export const getTags = async () => {
  const res = await mockApi.get("/tags");
  return res.data;
};

// export const getRooms = async () => {
//   const res = await mockApi.get("/rooms");
//   return res.data;
// };

export const FilterKhachSan = async (dto: HotelFilterParams) => {
  const res = await api.post("/api/hotels/search", dto);
  return res.data.data;
};

export const getRoomById = async (id: string | number) => {
  const res = await mockApi.get(`/rooms/${id}`);
  return res.data;
};

export const getRoomsByCity = async (city: string) => {
  const res = await mockApi.get(`/rooms?city=${encodeURIComponent(city)}`);
  return res.data;
};
