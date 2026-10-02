export interface KhachSan{
    id: string;
    nguoiTao: string;
    tenKhachSan: string;
    moTa: string;
    diaChi: string;
    thanhPho: string;
    viDo: number;
    kinhDo: number;
    soSao: number;
    gioNhanPhong: string;
    gioTraPhong: string;
    chinhSachHuy?: string | null;
    trangThai: string;
    ngayTao: Date;
    fullName: string;
    totalRow: number;
}