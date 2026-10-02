import api from "../axiosInstance";

export interface CreateReviewRequest { khachSanId: string; soSao: number; noiDung: string; }
export interface OwnerReviewResponseRequest { response: string; }
export interface OwnerReviewReportRequest { reason: string; }
export const getHotelReviews = async (hotelId: string) => (await api.get(`/api/reviews/hotel/${hotelId}`)).data;
export const getMyReviews = async () => (await api.get("/api/reviews/mine")).data;
export const createReview = async (payload: CreateReviewRequest) => (await api.post("/api/reviews", payload)).data;
export const getOwnerHotelReviews = async (hotelId: string) => (await api.get(`/api/reviews/owner/hotel/${hotelId}`)).data;
export const respondToOwnerReview = async (reviewId: string, payload: OwnerReviewResponseRequest) => (await api.put(`/api/reviews/owner/${reviewId}/response`, payload)).data;
export const reportOwnerReview = async (reviewId: string, payload: OwnerReviewReportRequest) => (await api.post(`/api/reviews/owner/${reviewId}/report`, payload)).data;
export const deleteReview = async (reviewId: string) => (await api.delete(`/api/reviews/${reviewId}`)).data;