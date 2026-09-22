import api from "../axiosInstance";

export interface CreateRoomRequest { LoaiPhongId: string; SoPhong?: string; Tang?: number; TrangThai?: string; }

export const createRoom = async (payload: CreateRoomRequest) => (await api.post("/api/rooms", payload)).data;