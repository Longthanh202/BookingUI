import api from "../axiosInstance";

export interface CreateAmenityRequest { tenTienIch: string; icon?: string | null; khachSanId: string; }

export const createAmenity = async (payload: CreateAmenityRequest) => (await api.post("/api/amenities", payload)).data;