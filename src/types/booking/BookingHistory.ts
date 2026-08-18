export interface BookingRoom {
  id: string;
  soPhong: string;
  trangThai: string;
}

export interface BookingDetail {
  id: string;
  loaiPhongId: string;
  tenLoaiPhong: string;
  gia: number;
  phongs: BookingRoom[];
}

export interface Booking {
  id: string;
  trangThai: string;
  thanhToan: string;
  khachSanId: string;
  tenKhachSan: string;
  chiTietDatPhongs: BookingDetail[];
}

export interface BookingHistoryResponse {
  data: Booking[];
  totalRow: number;
  totalPage: number;
}