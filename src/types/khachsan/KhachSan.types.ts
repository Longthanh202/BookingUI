export interface KhachSanListParams {
    Keyword?: string;
    ThanhPho?: string;
    ViDo?: number;
    KinhDo?: number;
    SoSao?: number;
    TrangThai?: string;
    Page?: number;
}

export interface HotelFilterParams extends KhachSanListParams {
    ProvinceCode?: string | null;
    SoKhach?: number | null;
    NgayNhanPhong?: string | null;
    NgayTraPhong?: string | null;
}

export interface KhachSanListOwnerParams{
    Page?: number;
}