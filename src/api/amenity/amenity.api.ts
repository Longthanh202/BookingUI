import api from "../axiosInstance";

export interface CreateAmenityRequest { TenTienIch?: string; Icon?: string; KhachSanId: string; }

export const createAmenities = async (payload: CreateAmenityRequest[]) => (await api.post("/api/amenities", payload)).data;