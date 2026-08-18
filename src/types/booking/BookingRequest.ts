export interface BookingRoomRequest {
  loaiPhongId: string;
  soLuong: number;
}

export interface BookingRequest {
  khachSanId: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  phuongThucThanhToan: string;
  danhSachPhong: BookingRoomRequest[];
}