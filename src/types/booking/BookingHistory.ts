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
  maDatPhong?: string;
  trangThai: string;
  thanhToan: string;
  khachSanId: string;
  tenKhachSan: string;
  soTienGiam?: number;
  ngayTao?: string;
  ngayNhan?: string;
  ngayTra?: string;
  chiTietDatPhongs: BookingDetail[];
}

export interface BookingHistoryResponse {
  data: Booking[];
  totalRow: number;
  totalPage: number;
}