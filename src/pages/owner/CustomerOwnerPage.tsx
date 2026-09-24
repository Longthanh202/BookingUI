import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Form, Table } from "react-bootstrap";
import { getOwnerAllBookings } from "../../api/booking/booking.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { responseRows, valueOf } from "../../components/owner/OwnerWorkspaceData";

export default function CustomerOwnerPage() {
	const [search, setSearch] = useState(""); const { data } = useQuery({ queryKey: ["owner-all-bookings"], queryFn: () => getOwnerAllBookings({ page: 1, pageSize: 200 }) }); const bookings = responseRows(data);
	const customers = Array.from(new Map(bookings.map((row) => [valueOf(row, "customerId", "khachHangId", "email", "tenKhachHang"), row])).values()).filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
	return <OwnerPageShell title="Khách hàng" description="Xem khách đã lưu trú và lịch sử booking liên quan đến property"><Card className="owner-panel"><Card.Body><div className="owner-toolbar px-0 pt-0"><div><h5>Danh sách khách hàng</h5><span>{customers.length} khách từ booking thật</span></div><Form.Control className="w-auto" placeholder="Tìm tên, email, số điện thoại" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Table responsive className="owner-table align-middle"><thead><tr><th>Khách hàng</th><th>Email</th><th>Số điện thoại</th><th>Số booking</th></tr></thead><tbody>{customers.map((row, index) => <tr key={index}><td>{valueOf(row, "tenKhachHang", "hoTen", "guest")}</td><td>{valueOf(row, "email")}</td><td>{valueOf(row, "soDienThoai", "phone")}</td><td>{bookings.filter((item) => valueOf(item, "customerId", "khachHangId", "email", "tenKhachHang") === valueOf(row, "customerId", "khachHangId", "email", "tenKhachHang")).length}</td></tr>)}</tbody></Table></Card.Body></Card></OwnerPageShell>;
}
