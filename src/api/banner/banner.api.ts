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

export interface BannerSearchParams { keyword?: string; isActive?: number; startRow?: number; endRow?: number; }
export interface UpdateBannerPayload { title: string; subtitle: string; url: string; isActive: number; }
export const getBanners = async (params?: BannerSearchParams) => (await api.get("/api/banners", { params })).data;
export const updateBanner = async (id: string, payload: UpdateBannerPayload) => (await api.put(`/api/banners/${id}`, payload)).data;
export const deleteBanner = async (id: string) => (await api.delete(`/api/banners/${id}`)).data;