import { Button, Form, Table } from "react-bootstrap";

export const rows = (data: any): any[] => Array.isArray(data) ? data : data?.data || data?.items || data?.results || [];
export const field = (item: any, ...keys: string[]) => keys.map((key) => item?.[key] ?? item?.[key.charAt(0).toUpperCase() + key.slice(1)]).find((value) => value !== undefined && value !== null) ?? "-";

const headers: Record<string, string> = { gia: "Giá", ngayBatDau: "Ngày bắt đầu", ngayKetThuc: "Ngày kết thúc", soTien: "Số tiền", trangThai: "Trạng thái", createdAt: "Ngày tạo", tenNganHang: "Tên ngân hàng", soTaiKhoan: "Số tài khoản", chuTaiKhoan: "Chủ tài khoản", chiNhanh: "Chi nhánh", loaiGiaoDich: "Loại giao dịch", soSao: "Số sao", noiDung: "Nội dung", goiQuangCaoId: "Mã gói quảng cáo" };

type DataTableProps = { data: any; columns: string[]; money?: string[]; actions?: (item: any) => JSX.Element; actionLabel?: string; onAction?: (item: any) => void };
export function DataTable({ data, columns, money = [], actions, actionLabel, onAction }: DataTableProps) {
  return <Table responsive hover className="mt-3"><thead><tr>{columns.map((column) => <th key={column}>{headers[column] || column}</th>)}{(actions || actionLabel) && <th>Thao tác</th>}</tr></thead><tbody>{rows(data).map((item: any, index) => <tr key={field(item, "id") || index}>{columns.map((column) => { const value = field(item, column); return <td key={column}>{money.includes(column) ? `${Number(value === "-" ? 0 : value).toLocaleString("vi-VN")} đ` : String(value)}</td>; })}{actions && <td>{actions(item)}</td>}{actionLabel && <td><Button size="sm" onClick={() => onAction?.(item)}>{actionLabel}</Button></td>}</tr>)}</tbody></Table>;
}

export function Field({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (value: string) => void; type?: string }) {
  return <div className="col-md-3 mb-2"><Form.Label>{label}</Form.Label><Form.Control type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
