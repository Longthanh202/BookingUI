import { Badge, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

export const responseRows = (value: any): any[] => Array.isArray(value) ? value : value?.data || value?.items || value?.results || [];
export const valueOf = (row: any, ...keys: string[]) => keys.map((key) => row?.[key] ?? row?.[key.charAt(0).toUpperCase() + key.slice(1)]).find((value) => value !== undefined && value !== null) ?? "-";

const statusVariant: Record<string, string> = { "Chờ xác nhận": "warning", "Đã xác nhận": "primary", "Đã nhận phòng": "info", "Hoàn tất": "success", "Đã hủy": "danger", "Đang bán": "success", "Đang bảo trì": "secondary" };

export const roomRows = [
  { room: "Deluxe River View", property: "Stayro Riverside", total: 18, available: 7, price: "1.600.000 đ", status: "Đang bán" },
  { room: "Suite Balcony", property: "Stayro Riverside", total: 8, available: 2, price: "2.400.000 đ", status: "Đang bán" },
  { room: "Garden Bungalow", property: "Mộc Châu Retreat", total: 12, available: 9, price: "1.225.000 đ", status: "Đang bảo trì" },
];

export function BookingTable({ rows, compact = false }: { rows: any[]; compact?: boolean }) {
  return <Table responsive className="owner-table align-middle mb-0"><thead><tr><th>Booking</th><th>Khách hàng</th><th>Phòng</th><th>Ngày lưu trú</th><th>Giá trị</th><th>Trạng thái</th>{!compact && <th />}</tr></thead><tbody>{rows.slice(0, compact ? 3 : rows.length).map((row, index) => { const id = valueOf(row, "id", "maBooking"); const status = String(valueOf(row, "trangThai", "status")); return <tr key={id === "-" ? index : id}><td><strong>{id}</strong><small>{valueOf(row, "tenKhachSan", "property")}</small></td><td>{valueOf(row, "tenKhachHang", "guest", "hoTen")}</td><td>{valueOf(row, "tenLoaiPhong", "room")}</td><td>{valueOf(row, "ngayNhanPhong", "checkIn")} - {valueOf(row, "ngayTraPhong", "checkOut")}</td><td><strong>{Number(valueOf(row, "tongTien", "amount") === "-" ? 0 : valueOf(row, "tongTien", "amount")).toLocaleString("vi-VN")} đ</strong></td><td><Badge bg={statusVariant[status] || "secondary"}>{status}</Badge></td>{!compact && <td><Button variant="link" size="sm" title="Xem booking"><FontAwesomeIcon icon={faEye} /></Button></td>}</tr>; })}</tbody></Table>;
}

export function StatusBadge({ status }: { status: string }) { return <Badge bg={statusVariant[status] || "secondary"}>{status}</Badge>; }
