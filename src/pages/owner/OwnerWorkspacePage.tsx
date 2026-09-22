import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faBed,
  faCalendarDays,
  faChartLine,
  faChevronRight,
  faCircleExclamation,
  faClock,
  faEllipsis,
  faEye,
  faFilter,
  faPlus,
  faRotate,
  faStar,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Badge, Card, Col, Form, Row, Table } from "react-bootstrap";
import "./OwnerWorkspacePage.css";

type OwnerSection = "dashboard" | "bookings" | "calendar" | "rooms" | "pricing" | "customers" | "reports" | "reviews" | "staff" | "notifications" | "wallet";

const bookingRows = [
  { id: "ST-1082", guest: "Nguyễn Minh Anh", property: "Stayro Riverside", room: "Deluxe River View", dates: "22 - 24/09/2026", amount: "3.200.000 đ", status: "Chờ xác nhận" },
  { id: "ST-1081", guest: "Trần Hoàng Nam", property: "Stayro Riverside", room: "Suite Balcony", dates: "22 - 26/09/2026", amount: "6.800.000 đ", status: "Đã xác nhận" },
  { id: "ST-1077", guest: "Lê Thu Hà", property: "Mộc Châu Retreat", room: "Garden Bungalow", dates: "21 - 23/09/2026", amount: "2.450.000 đ", status: "Đã nhận phòng" },
  { id: "ST-1072", guest: "Phạm Gia Bảo", property: "Stayro Riverside", room: "Standard King", dates: "18 - 20/09/2026", amount: "1.800.000 đ", status: "Hoàn tất" },
];

const roomRows = [
  { room: "Deluxe River View", property: "Stayro Riverside", total: 18, available: 7, price: "1.600.000 đ", status: "Đang bán" },
  { room: "Suite Balcony", property: "Stayro Riverside", total: 8, available: 2, price: "2.400.000 đ", status: "Đang bán" },
  { room: "Garden Bungalow", property: "Mộc Châu Retreat", total: 12, available: 9, price: "1.225.000 đ", status: "Đang bảo trì" },
];

const statusVariant: Record<string, string> = { "Chờ xác nhận": "warning", "Đã xác nhận": "primary", "Đã nhận phòng": "info", "Hoàn tất": "success", "Đã hủy": "danger", "Đang bán": "success", "Đang bảo trì": "secondary" };

const sectionMeta: Record<OwnerSection, { title: string; eyebrow: string; description: string }> = {
  dashboard: { title: "Tổng quan vận hành", eyebrow: "OWNER CONSOLE", description: "Nắm nhanh tình hình kinh doanh và những việc cần xử lý hôm nay." },
  bookings: { title: "Quản lý booking", eyebrow: "RESERVATIONS", description: "Xác nhận, check-in, check-out và theo dõi toàn bộ booking của property." },
  calendar: { title: "Lịch phòng", eyebrow: "AVAILABILITY", description: "Theo dõi công suất theo ngày và đánh dấu thời gian không khả dụng." },
  rooms: { title: "Phòng & resource", eyebrow: "INVENTORY", description: "Quản lý loại phòng, sức chứa, giá và trạng thái khai thác." },
  pricing: { title: "Giá & khuyến mãi", eyebrow: "REVENUE", description: "Thiết lập giá cơ bản, mùa cao điểm và chương trình ưu đãi." },
  customers: { title: "Khách hàng", eyebrow: "RELATIONSHIPS", description: "Xem khách đã lưu trú và lịch sử booking liên quan đến property." },
  reports: { title: "Doanh thu & báo cáo", eyebrow: "ANALYTICS", description: "Đo lường doanh thu, số booking, tỷ lệ hủy và phí nền tảng." },
  reviews: { title: "Review của khách", eyebrow: "REPUTATION", description: "Theo dõi phản hồi và xây dựng uy tín cho property." },
  staff: { title: "Đội ngũ nhân sự", eyebrow: "TEAM ACCESS", description: "Phân quyền nhân viên theo property và vai trò vận hành." },
  notifications: { title: "Thông báo", eyebrow: "INBOX", description: "Các cập nhật quan trọng về booking, thanh toán và property." },
  wallet: { title: "Ví & lịch sử giao dịch", eyebrow: "FINANCE", description: "Theo dõi số dư, phí nền tảng và lịch sử dòng tiền của owner." },
};

const getSection = (path: string): OwnerSection => {
  const value = path.split("/").filter(Boolean).pop() as OwnerSection;
  return sectionMeta[value] ? value : "dashboard";
};

const MetricCard = ({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: any; tone: string }) => (
  <Card className={`owner-metric owner-metric-${tone}`}>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <span className="owner-metric-icon"><FontAwesomeIcon icon={icon} /></span>
        <FontAwesomeIcon icon={faEllipsis} className="text-muted" />
      </div>
      <div className="owner-metric-label">{label}</div>
      <div className="owner-metric-value">{value}</div>
      <div className="owner-metric-note"><FontAwesomeIcon icon={faArrowTrendUp} /> {note}</div>
    </Card.Body>
  </Card>
);

const BookingTable = ({ compact = false }: { compact?: boolean }) => (
  <Table responsive className="owner-table align-middle mb-0">
    <thead><tr><th>Booking</th><th>Khách hàng</th><th>Phòng</th><th>Ngày lưu trú</th><th>Giá trị</th><th>Trạng thái</th>{!compact && <th />}</tr></thead>
    <tbody>{bookingRows.slice(0, compact ? 3 : bookingRows.length).map((row) => <tr key={row.id}>
      <td><strong>{row.id}</strong><small>{row.property}</small></td><td>{row.guest}</td><td>{row.room}</td><td>{row.dates}</td><td><strong>{row.amount}</strong></td><td><Badge bg={statusVariant[row.status] || "secondary"}>{row.status}</Badge></td>{!compact && <td><Button variant="link" size="sm"><FontAwesomeIcon icon={faEye} /></Button></td>}
    </tr>)}</tbody>
  </Table>
);

const Dashboard = () => (
  <>
    <Row className="g-3 mb-4"><Col md={6} xl={3}><MetricCard label="Tổng booking" value="1.284" note="12,8% so với tháng trước" icon={faCalendarDays} tone="blue" /></Col><Col md={6} xl={3}><MetricCard label="Doanh thu tháng này" value="284,6M" note="8,4% so với tháng trước" icon={faChartLine} tone="orange" /></Col><Col md={6} xl={3}><MetricCard label="Công suất phòng" value="78,4%" note="Tăng 5,2% tuần này" icon={faBed} tone="green" /></Col><Col md={6} xl={3}><MetricCard label="Khách đang lưu trú" value="46" note="8 check-in hôm nay" icon={faUsers} tone="purple" /></Col></Row>
    <Row className="g-4 mb-4"><Col xl={8}><Card className="owner-panel h-100"><Card.Body><div className="owner-panel-heading"><div><h5>Doanh thu theo thời gian</h5><span>Hiệu quả kinh doanh trong 7 ngày gần nhất</span></div><Form.Select size="sm" className="owner-select"><option>7 ngày qua</option><option>30 ngày qua</option><option>Năm nay</option></Form.Select></div><div className="revenue-chart"><div className="chart-axis"><span>60M</span><span>40M</span><span>20M</span><span>0</span></div><div className="chart-bars">{[52, 68, 45, 78, 62, 88, 72].map((height, index) => <div className="chart-column" key={index}><div className="chart-bar" style={{ height: `${height}%` }}><span>{height === 88 ? "42M" : ""}</span></div><small>{["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index]}</small></div>)}</div></div></Card.Body></Card></Col><Col xl={4}><Card className="owner-panel h-100"><Card.Body><div className="owner-panel-heading"><div><h5>Việc cần xử lý</h5><span>Trong ngày hôm nay</span></div><Badge bg="warning" text="dark">4 mục</Badge></div><div className="todo-list"><div><span className="todo-icon warning"><FontAwesomeIcon icon={faClock} /></span><p><strong>3 booking chờ xác nhận</strong><small>Cần phản hồi trong 2 giờ tới</small></p><FontAwesomeIcon icon={faChevronRight} /></div><div><span className="todo-icon danger"><FontAwesomeIcon icon={faCircleExclamation} /></span><p><strong>1 phòng cần bảo trì</strong><small>Deluxe River View · Phòng 204</small></p><FontAwesomeIcon icon={faChevronRight} /></div><div><span className="todo-icon success"><FontAwesomeIcon icon={faStar} /></span><p><strong>5 review mới</strong><small>Điểm trung bình tháng này: 4.8</small></p><FontAwesomeIcon icon={faChevronRight} /></div></div></Card.Body></Card></Col></Row>
    <Card className="owner-panel"><Card.Body className="p-0"><div className="owner-panel-heading px-4 pt-4"><div><h5>Booking gần đây</h5><span>Cập nhật theo thời gian thực</span></div><Link to="/owner/bookings" className="btn btn-outline-dark btn-sm">Xem tất cả <FontAwesomeIcon icon={faChevronRight} /></Link></div><BookingTable compact /></Card.Body></Card>
  </>
);

const ModulePage = ({ section }: { section: OwnerSection }) => {
  const [showForm, setShowForm] = useState(false);
  if (section === "bookings") return <Card className="owner-panel"><Card.Body className="p-0"><div className="owner-toolbar"><div><h5>Danh sách booking</h5><span>1.284 booking trong hệ thống</span></div><div className="d-flex gap-2"><Button variant="outline-dark"><FontAwesomeIcon icon={faFilter} /> Lọc</Button><Button variant="dark" onClick={() => setShowForm(!showForm)}><FontAwesomeIcon icon={faPlus} /> Tạo booking</Button></div></div>{showForm && <div className="quick-form"><Form.Control placeholder="Tên khách hàng" /><Form.Control placeholder="Mã booking / property" /><Button variant="dark" onClick={() => setShowForm(false)}>Lưu booking</Button></div>}<BookingTable /></Card.Body></Card>;
  if (section === "rooms") return <Card className="owner-panel"><Card.Body className="p-0"><div className="owner-toolbar"><div><h5>Danh sách loại phòng</h5><span>38 resource thuộc 2 property</span></div><Button variant="dark" onClick={() => setShowForm(!showForm)}><FontAwesomeIcon icon={faPlus} /> Thêm loại phòng</Button></div>{showForm && <div className="quick-form"><Form.Control placeholder="Tên loại phòng" /><Form.Control placeholder="Sức chứa" type="number" /><Form.Control placeholder="Giá cơ bản" /><Button variant="dark" onClick={() => setShowForm(false)}>Lưu loại phòng</Button></div>}<Table responsive className="owner-table align-middle mb-0"><thead><tr><th>Loại phòng</th><th>Property</th><th>Tổng số</th><th>Còn trống</th><th>Giá / đêm</th><th>Trạng thái</th><th /></tr></thead><tbody>{roomRows.map((room) => <tr key={room.room}><td><strong>{room.room}</strong><small>2 giường · tối đa 3 khách</small></td><td>{room.property}</td><td>{room.total}</td><td><strong className="text-success">{room.available}</strong></td><td>{room.price}</td><td><Badge bg={statusVariant[room.status]}>{room.status}</Badge></td><td><Button variant="link"><FontAwesomeIcon icon={faEllipsis} /></Button></td></tr>)}</tbody></Table></Card.Body></Card>;
  if (section === "calendar") return <Card className="owner-panel"><Card.Body><div className="owner-toolbar px-0 pt-0"><div><h5>Lịch availability</h5><span>Tuần 21 - 27 tháng 09, 2026</span></div><div className="d-flex gap-2"><Button variant="outline-dark">Hôm nay</Button><Button variant="dark"><FontAwesomeIcon icon={faPlus} /> Chặn ngày</Button></div></div><div className="calendar-grid"><div className="calendar-header"><span>Resource</span>{["T2 21", "T3 22", "T4 23", "T5 24", "T6 25", "T7 26", "CN 27"].map((day) => <strong key={day}>{day}</strong>)}</div>{roomRows.map((room, index) => <div className="calendar-row" key={room.room}><span>{room.room}</span>{[0,1,2,3,4,5,6].map((day) => <div key={day} className={`calendar-cell ${day === index + 1 || (index === 0 && day > 4) ? "booked" : "available"}`}>{day === index + 1 ? "Đã đặt" : ""}</div>)}</div>)}</div></Card.Body></Card>;
  const genericData = section === "customers" ? ["Nguyễn Minh Anh", "Trần Hoàng Nam", "Lê Thu Hà", "Phạm Gia Bảo"] : section === "reviews" ? ["Không gian đẹp, nhân viên rất nhiệt tình", "Phòng sạch và view sông tuyệt vời", "Bữa sáng ngon, sẽ quay lại"] : section === "staff" ? ["Nguyễn Hải Yến", "Đỗ Minh Quân", "Vũ Thanh Tùng"] : section === "notifications" ? ["Booking ST-1082 đang chờ xác nhận", "Property Stayro Riverside đã được duyệt", "Bạn nhận được một review 5 sao mới"] : ["Stayro Riverside", "Mộc Châu Retreat", "Sunset Bay Villa"];
  return <Row className="g-4">{genericData.map((item, index) => <Col md={6} xl={4} key={item}><Card className="owner-list-card h-100"><Card.Body><div className="d-flex justify-content-between"><span className={`owner-list-icon icon-${index % 3}`}><FontAwesomeIcon icon={section === "customers" ? faUsers : section === "reviews" ? faStar : section === "notifications" ? faCircleExclamation : section === "reports" ? faChartLine : faBed} /></span><FontAwesomeIcon icon={faEllipsis} className="text-muted" /></div><h5>{item}</h5><p>{section === "customers" ? `${12 + index * 4} booking · Lần gần nhất 22/09/2026` : section === "reviews" ? `${5 - index} sao · 2 giờ trước` : section === "reports" ? `${(84 - index * 11)} booking · Doanh thu ${32 - index * 4},5M` : section === "staff" ? ["Quản lý property", "Lễ tân", "Nhân viên vận hành"][index] : section === "notifications" ? "Cần kiểm tra và phản hồi" : "Đang hoạt động · Đã duyệt"}</p><Button variant="link" className="px-0">Xem chi tiết <FontAwesomeIcon icon={faChevronRight} /></Button></Card.Body></Card></Col>)}<Col md={6} xl={4}><Card className="owner-list-card add-card h-100" onClick={() => setShowForm(!showForm)}><Card.Body><span><FontAwesomeIcon icon={faPlus} /></span><h5>Thêm {section === "staff" ? "nhân viên" : section === "reviews" ? "phản hồi" : "mới"}</h5><p>Tạo mới và cập nhật thông tin trực tiếp</p></Card.Body></Card></Col></Row>;
};

export default function OwnerWorkspacePage() {
  const section = getSection(useLocation().pathname);
  const meta = sectionMeta[section];
  const today = useMemo(() => new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long" }).format(new Date()), []);
  return <div className="owner-workspace"><div className="owner-page-heading"><div><div className="owner-eyebrow">{meta.eyebrow}</div><h1>{meta.title}</h1><p>{meta.description}</p></div><div className="owner-date"><FontAwesomeIcon icon={faCalendarDays} /> {today}<Button variant="light" title="Làm mới"><FontAwesomeIcon icon={faRotate} /></Button></div></div>{section === "dashboard" ? <Dashboard /> : <ModulePage section={section} />}</div>;
}