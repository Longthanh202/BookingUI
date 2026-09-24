import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Form } from "react-bootstrap";
import { getOwnerAllBookings } from "../../api/booking/booking.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { BookingTable, responseRows, valueOf } from "../../components/owner/OwnerWorkspaceData";

export default function ReportOwnerPage() {
	const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const { data } = useQuery({ queryKey: ["owner-all-bookings"], queryFn: () => getOwnerAllBookings({ page: 1, pageSize: 200 }) }); const bookings = responseRows(data);
	const filtered = bookings.filter((row) => { const date = String(valueOf(row, "ngayTao", "createdAt", "ngayNhanPhong")); return (!from || date >= from) && (!to || date <= to); });
	return <OwnerPageShell title="Doanh thu & báo cáo" description="Đo lường doanh thu, số booking, tỷ lệ hủy và phí nền tảng"><Card className="owner-panel"><Card.Body><div className="owner-toolbar px-0 pt-0"><div><h5>Báo cáo doanh thu</h5><span>Lọc trực tiếp trên dữ liệu booking</span></div><div className="d-flex gap-2"><Form.Control type="date" value={from} onChange={(event) => setFrom(event.target.value)} /><Form.Control type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div></div><BookingTable rows={filtered} /></Card.Body></Card></OwnerPageShell>;
}
