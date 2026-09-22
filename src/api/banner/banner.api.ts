import api from "../axiosInstance";

export interface BannerPayload { Title: string; Subtitle: string; IsActive: number; File: File; }

export const createBanner = async (payload: BannerPayload) => {
  const formData = new FormData();
  formData.append("Title", payload.Title);
  formData.append("Subtitle", payload.Subtitle);
  formData.append("IsActive", String(payload.IsActive));
  formData.append("File", payload.File);
  return (await api.post("/api/banners", formData)).data;
};

export const getActiveBanners = async () => (await api.get("/api/banners/active")).data;