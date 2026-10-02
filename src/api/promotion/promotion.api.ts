import api from "../axiosInstance";

export interface PromotionRequest {
  code: string;
  name: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount: number | null;
  startsAt: string;
  endsAt: string;
}

export const getOwnerPromotions = async (hotelId: string) =>
  (await api.get("/api/owner/promotions", { params: { hotelId } })).data;

export const createOwnerPromotion = async (hotelId: string, payload: PromotionRequest) =>
  (await api.post("/api/owner/promotions", payload, { params: { hotelId } })).data;

export const updateOwnerPromotion = async (promotionId: string, payload: PromotionRequest) =>
  (await api.put(`/api/owner/promotions/${promotionId}`, payload)).data;

export const deleteOwnerPromotion = async (promotionId: string) =>
  (await api.delete(`/api/owner/promotions/${promotionId}`)).data;
