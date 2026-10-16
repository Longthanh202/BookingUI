import { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import NumberedPagination from "../common/NumberedPagination";

export const rows = (data: any): any[] => Array.isArray(data) ? data : data?.data || data?.items || data?.results || [];
export const field = (item: any, ...keys: string[]) => keys.map((key) => item?.[key] ?? item?.[key.charAt(0).toUpperCase() + key.slice(1)]).find((value) => value !== undefined && value !== null) ?? "-";

const headers: Record<string, string> = { gia: "Giá", ngayBatDau: "Ngày bắt đầu", ngayKetThuc: "Ngày kết thúc", soTien: "Số tiền", trangThai: "Trạng thái", createdAt: "Ngày tạo", tenNganHang: "Tên ngân hàng", soTaiKhoan: "Số tài khoản", chuTaiKhoan: "Chủ tài khoản", chiNhanh: "Chi nhánh", loaiGiaoDich: "Loại giao dịch", soSao: "Số sao", noiDung: "Nội dung", goiQuangCaoId: "Mã gói quảng cáo", code: "Mã", name: "Tên", discountType: "Loại giảm", discountValue: "Giá trị giảm", startsAt: "Bắt đầu", endsAt: "Kết thúc" };

type DataTableProps = { data: any; columns: string[]; money?: string[]; actions?: (item: any) => JSX.Element; actionLabel?: string; onAction?: (item: any) => void; pageSize?: number };
export function DataTable({ data, columns, money = [], actions, actionLabel, onAction, pageSize = 10 }: DataTableProps) {
  const [page, setPage] = useState(1);
  const dataRows = rows(data);
  const totalPages = Math.max(1, Math.ceil(dataRows.length / pageSize));
  const visibleRows = dataRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [data]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return <>
    <div className="table-responsive owner-data-table-scroll mt-3">
      <Table hover className="mb-0">
        <thead><tr>{columns.map((column) => <th key={column}>{headers[column] || column}</th>)}{(actions || actionLabel) && <th>Thao tác</th>}</tr></thead>
        <tbody>{visibleRows.map((item: any, index) => <tr key={field(item, "id") || (page - 1) * pageSize + index}>{columns.map((column) => { const value = field(item, column); return <td key={column}>{money.includes(column) ? `${Number(value === "-" ? 0 : value).toLocaleString("vi-VN")} đ` : String(value)}</td>; })}{actions && <td>{actions(item)}</td>}{actionLabel && <td><Button size="sm" onClick={() => onAction?.(item)}>{actionLabel}</Button></td>}</tr>)}</tbody>
      </Table>
    </div>
    <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} />
  </>;
}

export function Field({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (value: string) => void; type?: string }) {
  return <div className="col-md-3 mb-2"><Form.Label>{label}</Form.Label><Form.Control type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
