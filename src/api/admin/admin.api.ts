import api from "../axiosInstance";

export interface AdminUserSearchParams {
  keyword?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface OwnerRegistrationSearchParams {
  keyword?: string;
  status?: 0 | 1 | 2;
  page: number;
  pageSize: number;
}

export interface OwnerRegistration {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  approvalStatus: 0 | 1 | 2;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branch: string | null;
  } | null;
}

export interface OwnerRegistrationPage {
  data: OwnerRegistration[];
  totalRow: number;
  totalPage: number;
  page: number;
  pageSize: number;
}

export interface AdminTagPayload {
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export const searchAdminUsers = async (params: AdminUserSearchParams) =>
  (await api.get("/api/users/admin", { params })).data;

export const updateAdminUserStatus = async (userId: string, isDel: 0 | 1) =>
  (await api.put(`/api/users/admin/${userId}/status`, { isDel })).data;

export const searchOwnerRegistrations = async (params: OwnerRegistrationSearchParams): Promise<OwnerRegistrationPage> =>
  (await api.get<OwnerRegistrationPage>("/api/users/admin/owner-registrations", { params })).data;

export const approveOwnerRegistration = async (userId: string) =>
  (await api.put(`/api/users/admin/owner-registrations/${userId}/approve`)).data;

export const rejectOwnerRegistration = async (userId: string, reason: string) =>
  (await api.put(`/api/users/admin/owner-registrations/${userId}/reject`, { reason })).data;

export const getAdminTags = async () =>
  (await api.get("/api/tags/admin")).data;

export const createAdminTag = async (payload: AdminTagPayload) =>
  (await api.post("/api/tags/admin", payload)).data;

export const updateAdminTag = async (tagId: string, payload: AdminTagPayload) =>
  (await api.put(`/api/tags/admin/${tagId}`, payload)).data;

export const replaceAdminTagHotels = async (tagId: string, hotelIds: string[]) =>
  (await api.put(`/api/tags/admin/${tagId}/hotels`, { hotelIds })).data;

export const disableAdminTag = async (tagId: string) =>
  (await api.delete(`/api/tags/admin/${tagId}`)).data;