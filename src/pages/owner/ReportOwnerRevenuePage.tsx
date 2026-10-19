import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Form, Spinner, Table } from "react-bootstrap";
import { useOwnerHotels, useOwnerRevenueReport } from "../../hooks/useOwnerQueries";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import NumberedPagination from "../../components/common/NumberedPagination";
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
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const hotels = useOwnerHotels();
	const params = useMemo(() => ({ from: isoStart(from), to: isoStart(to), groupBy, hotelId: hotelId || undefined }), [from, to, groupBy, hotelId]);
	const report = useOwnerRevenueReport(params, !!from && !!to && from < to);
	const entries = rows(report.data?.data ?? report.data);
	const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
	useEffect(() => {
		setPage(1);
	}, [params]);
	useEffect(() => {
		setPage((current) => Math.min(current, totalPages));
	}, [totalPages]);
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
				<tbody>{entries.slice((page - 1) * pageSize, page * pageSize).map((entry: any, index: number) => {
					const period = read(entry, "period", "date", "month", "year", "ky");
					const cancellationRate = read(entry, "cancellationRate", "cancelRate", "tyLeHuy");
					return <tr key={String(period ?? index)}><td>{period ?? "—"}</td><td>{Number(read(entry, "revenue", "doanhThu", "totalRevenue") ?? 0).toLocaleString("vi-VN")} đ</td><td>{read(entry, "bookingCount", "bookings", "soBooking", "totalBookings") ?? "—"}</td><td>{cancellationRate === undefined ? "—" : `${cancellationRate} %`}</td></tr>;
				})}</tbody>
			</Table>}
			{!report.isLoading && !report.isError && <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} />}
			{!report.isLoading && !report.isError && !entries.length && <p className="text-muted mb-0">Không có dữ liệu trong khoảng thời gian này.</p>}
		</Card.Body></Card>
	</OwnerPageShell>;
}