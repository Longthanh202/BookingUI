export interface Booking {
  id?: string | number;
  userId?: string | number;
  roomId: string | number;
  roomName?: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalAmount: number;
  paymentMethod: "card" | "qr" | "pay_on_arrival";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt?: string;
}
