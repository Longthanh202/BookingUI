import { useOwnerDashboard } from "../../hooks/useOwnerQueries";
import { Alert, Card, Col, Row, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faCalendarDays, faChartLine, faCircleCheck, faClock, faUsers } from "@fortawesome/free-solid-svg-icons";
import OwnerPageShell from "../../components/owner/OwnerPageShell";

const read = (source: any, ...keys: string[]) => keys.map((key) => source?.[key] ?? source?.[key.charAt(0).toUpperCase() + key.slice(1)]).find((value) => value !== undefined && value !== null);
const count = (source: any, ...keys: string[]) => {
	const value = read(source, ...keys);
	return value === undefined ? "—" : Number(value).toLocaleString("vi-VN");
};
const money = (source: any, ...keys: string[]) => {
	const value = read(source, ...keys);
	return value === undefined ? "—" : `${Number(value).toLocaleString("vi-VN")} đ`;
};
const occupancy = (source: any) => {
	const value = read(source, "todayOccupancy", "todayOccupancyRate", "occupancyToday", "congSuatHomNay");
	return value === undefined ? "—" : `${Number(value).toLocaleString("vi-VN")} %`;
};

function Metric({ label, value, icon, tone }: { label: string; value: string; icon: any; tone: string }) {
	return <Card className={`owner-metric owner-metric-${tone}`}><Card.Body><span className="owner-metric-icon"><FontAwesomeIcon icon={icon} /></span><div className="owner-metric-label">{label}</div><div className="owner-metric-value">{value}</div></Card.Body></Card>;
}

export default function DashboardOwnerSummaryPage() {
	const dashboard = useOwnerDashboard();
	const data = dashboard.data?.data ?? dashboard.data ?? {};
	return <OwnerPageShell title="Tổng quan vận hành" description="Số liệu tổng hợp từ các property thuộc tài khoản của bạn.">
		{dashboard.isLoading ? <div className="py-5 text-center"><Spinner animation="border" role="status" /><span className="visually-hidden">Đang tải...</span></div> : dashboard.isError ? <Alert variant="danger">Không thể tải dữ liệu tổng quan.</Alert> : <>
			<Row className="g-3 mb-4">
				<Col sm={6} xl={3}><Metric label="Tổng booking" value={count(data, "totalBookings", "tongBooking", "bookingCount")} icon={faCalendarDays} tone="blue" /></Col>
				<Col sm={6} xl={3}><Metric label="Booking hôm nay" value={count(data, "todayBookings", "bookingsToday", "bookingHomNay")} icon={faClock} tone="orange" /></Col>
				<Col sm={6} xl={3}><Metric label="Booking sắp tới" value={count(data, "upcomingBookings", "bookingsUpcoming", "bookingSapToi")} icon={faUsers} tone="green" /></Col>
				<Col sm={6} xl={3}><Metric label="Công suất hôm nay" value={occupancy(data)} icon={faBed} tone="purple" /></Col>
			</Row>
			<Row className="g-3">
				<Col sm={6} xl={3}><Metric label="Booking hoàn tất" value={count(data, "completedBookings", "bookingCompleted", "bookingHoanTat")} icon={faCircleCheck} tone="green" /></Col>
				<Col sm={6} xl={3}><Metric label="Booking đã hủy" value={count(data, "cancelledBookings", "bookingCancelled", "bookingDaHuy")} icon={faCalendarDays} tone="orange" /></Col>
				<Col sm={6} xl={3}><Metric label="Doanh thu tháng" value={money(data, "monthRevenue", "revenueThisMonth", "doanhThuThang")} icon={faChartLine} tone="blue" /></Col>
				<Col sm={6} xl={3}><Metric label="Doanh thu năm" value={money(data, "yearRevenue", "revenueThisYear", "doanhThuNam")} icon={faChartLine} tone="purple" /></Col>
			</Row>
		</>}
	</OwnerPageShell>;
}