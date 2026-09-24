import { Form } from "react-bootstrap";
import { field, rows } from "./OwnerDataTable";

type HotelSelectorProps = { data: any; value: string; onChange: (value: string) => void; onResetRoomType?: () => void };
export function HotelSelector({ data, value, onChange, onResetRoomType }: HotelSelectorProps) {
  return <Form.Select value={value} onChange={(event) => { onChange(event.target.value); onResetRoomType?.(); }}><option value="">Chọn khách sạn</option>{rows(data).map((hotel: any) => <option key={field(hotel, "id", "khachSanId")} value={field(hotel, "id", "khachSanId")}>{field(hotel, "tenKhachSan", "name")}</option>)}</Form.Select>;
}

type RoomTypeSelectorProps = { data: any; hotelId: string; value: string; onChange: (value: string) => void };
export function RoomTypeSelector({ data, hotelId, value, onChange }: RoomTypeSelectorProps) {
  return <Form.Select value={value} onChange={(event) => onChange(event.target.value)} disabled={!hotelId}><option value="">Chọn loại phòng</option>{rows(data).map((type: any) => <option key={field(type, "id", "loaiPhongId")} value={field(type, "id", "loaiPhongId")}>{field(type, "tenLoaiPhong", "name")}</option>)}</Form.Select>;
}
