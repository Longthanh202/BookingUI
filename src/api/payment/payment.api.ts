import api from "../axiosInstance";

export interface BookingQrPayment {
  bookingId: string;
  paymentId: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  paymentNote: string;
  qrCodeUrl: string;
}

export const getBookingQr = async (bookingId: string): Promise<BookingQrPayment> =>
  (await api.get(`/api/payments/booking/${bookingId}/qr`)).data;

export const getPayment = async (id: string) => (await api.get(`/api/payments/${id}`)).data;
export const getAdminPayments = async () => (await api.get("/api/payments/admin")).data;
export const updatePaymentStatus = async (id: string, trangThai: string) =>
  (await api.put(`/api/payments/admin/${id}/status`, { trangThai })).data;