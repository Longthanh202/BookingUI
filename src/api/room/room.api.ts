import api from "../axiosInstance";

export interface CreateRoomRequest { LoaiPhongId: string; SoPhong?: string; Tang?: number; TrangThai?: string; }

export const createRoom = async (payload: CreateRoomRequest) => (await api.post("/api/rooms", payload)).data;

export interface UpdateRoomRequest { soPhong: string; tang: number; trangThai: string; }
export interface RoomPriceRequest { loaiPhongId: string; gia: number; ngayBatDau: string; ngayKetThuc: string; }

export const getRoomsByRoomType = async (roomTypeId: string) =>
	(await api.get(`/api/rooms/by-room-type/${roomTypeId}`)).data;
export const updateRoom = async (roomId: string, payload: UpdateRoomRequest) =>
	(await api.put(`/api/rooms/${roomId}`, payload)).data;
export const deleteRoom = async (roomId: string) =>
	(await api.delete(`/api/rooms/${roomId}`)).data;
export const getRoomPrices = async (roomTypeId: string) =>
	(await api.get(`/api/rooms/prices/${roomTypeId}`)).data;
export const createRoomPrice = async (payload: RoomPriceRequest) =>
	(await api.post("/api/rooms/prices", payload)).data;