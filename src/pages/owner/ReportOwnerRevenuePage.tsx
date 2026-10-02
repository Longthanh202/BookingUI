import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Form, Spinner, Table } from "react-bootstrap";
import { getOwnerRevenueReport } from "../../api/owner.api";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { HotelSelector } from "../../components/owner/OwnerSelectors";
import { rows } from "../../components/owner/OwnerDataTable";

const isoStart = (date: string) => `${date}T00:00:00.000Z`;
const read = (source: any, ...keys: string[]) => keys.map((key) => source?.[key] ?? source?.[key.charAt(0).toUpperCase() + key.slice(1)]).find((value) => value !== undefined && value !== null);

export default function ReportOwnerRevenuePage() {
	const now = new Date();
	const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA"));
	const [to, setTo] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toLocaleDateString("en-CA"));
	const [groupBy, setGroupBy] = useState<"day" | "month" | "year">("day");
	const [hotelId, setHotelId] = useState("");
	const hotels = useQuery({ queryKey: ["owner-hotels"], queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }) });
	const params = useMemo(() => ({ from: isoStart(from), to: isoStart(to), groupBy, hotelId: hotelId || undefined }), [from, to, groupBy, hotelId]);
	const report = useQuery({ queryKey: ["owner-revenue-report", params], queryFn: () => getOwnerRevenueReport(params), enabled: !!from && !!to && from < to });
	const entries = rows(report.data?.data ?? report.data);
	return <OwnerPageShell title="Doanh thu & báo cáo" description="Doanh thu tính từ booking đã checkout; ngày kết thúc không thuộc khoảng báo cáo.">
		<Card className="owner-panel"><Card.Body>
			<div className="row g-3 align-items-end mb-3">
				<div className="col-lg-4"><Form.Label>Property</Form.Label><HotelSelector data={hotels.data} value={hotelId} onChange={setHotelId} /></div>
				<div className="col-sm-6 col-lg-2"><Form.Label>Từ ngày</Form.Label><Form.Control type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></div>
				<div className="col-sm-6 col-lg-2"><Form.Label>Đến ngày (không gồm)</Form.Label><Form.Control type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></div>
				<div className="col-lg-2"><Form.Label>Gom theo</Form.Label><Form.Select value={groupBy} onChange={(event) => setGroupBy(event.target.value as "day" | "month" | "year")}><option value="day">Ngày</option><option value="month">Tháng</option><option value="year">Năm</option></Form.Select></div>
			</div>
			{from >= to && <Alert variant="warning">Ngày kết thúc phải sau ngày bắt đầu.</Alert>}
			{report.isLoading ? <div className="py-4 text-center"><Spinner animation="border" role="status" /><span className="visually-hidden">Đang tải...</span></div> : report.isError ? <Alert variant="danger">Không thể tải báo cáo doanh thu.</Alert> : <Table responsive hover>
				<thead><tr><th>Kỳ</th><th>Doanh thu</th><th>Booking</th><th>Tỷ lệ hủy</th></tr></thead>
				<tbody>{entries.map((entry: any, index: number) => {
					const period = read(entry, "period", "date", "month", "year", "ky");
					const cancellationRate = read(entry, "cancellationRate", "cancelRate", "tyLeHuy");
					return <tr key={String(period ?? index)}><td>{period ?? "—"}</td><td>{Number(read(entry, "revenue", "doanhThu", "totalRevenue") ?? 0).toLocaleString("vi-VN")} đ</td><td>{read(entry, "bookingCount", "bookings", "soBooking", "totalBookings") ?? "—"}</td><td>{cancellationRate === undefined ? "—" : `${cancellationRate} %`}</td></tr>;
				})}</tbody>
			</Table>}
			{!report.isLoading && !report.isError && !entries.length && <p className="text-muted mb-0">Không có dữ liệu trong khoảng thời gian này.</p>}
		</Card.Body></Card>
	</OwnerPageShell>;
}