import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCalendarCheck, faChevronRight, faCreditCard, faHeart, faPen, faShieldHalved, faStar, faUser, faWallet } from "@fortawesome/free-solid-svg-icons";
import { Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import CustomerHeader from "../../components/customer/home/CustomerHeader/CustomerHeader";
import { getUser } from "../../utils/auth/auth";
import "./CustomerAccountPage.css";

type AccountSection = "profile" | "notifications" | "payments" | "reviews";
const notices = [
  { title: "Booking ST-1082 đã được xác nhận", text: "Stayro Riverside đã xác nhận phòng Deluxe River View của bạn.", time: "2 giờ trước", icon: faCalendarCheck, tone: "orange" },
  { title: "Thanh toán thành công", text: "Giao dịch 3.200.000đ cho kỳ nghỉ 22 - 24/09/2026 đã hoàn tất.", time: "3 giờ trước", icon: faCreditCard, tone: "green" },
  { title: "Ưu đãi cuối tuần ở Đà Lạt", text: "Giảm thêm 15% cho các property được yêu thích trong tháng này.", time: "Hôm qua", icon: faHeart, tone: "purple" },
];
const reviews = [
  { property: "Stayro Riverside", date: "18/09/2026", rating: 5, text: "Phòng sạch, view đẹp và host phản hồi rất nhanh." },
  { property: "Mộc Châu Retreat", date: "02/08/2026", rating: 4, text: "Không gian yên tĩnh, bữa sáng ngon. Sẽ quay lại." },
];

const CustomerAccountPage = () => {
  const user = getUser() as any;
  const location = useLocation();
  const rawSection = location.pathname.split("/").pop() as AccountSection;
  const section: AccountSection = ["profile", "notifications", "payments", "reviews"].includes(rawSection) ? rawSection : "profile";
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.FullName || user?.fullName || "Nguyễn Minh Anh");
  const [phone, setPhone] = useState("0901 234 567");
  const [email, setEmail] = useState(user?.email || "minhanh@email.com");

  const navItems = [
    { key: "profile", label: "Thông tin cá nhân", icon: faUser },
    { key: "notifications", label: "Thông báo", icon: faBell, count: 3 },
    { key: "payments", label: "Thanh toán & hoàn tiền", icon: faWallet },
    { key: "reviews", label: "Đánh giá của tôi", icon: faStar },
  ];

  return <div className="account-page"><CustomerHeader /><main className="account-container"><div className="account-intro"><div><div className="account-kicker">MY STAYRO</div><h1>Tài khoản của tôi</h1><p>Quản lý thông tin, chuyến đi và những điều bạn yêu thích.</p></div><Link className="account-bookings" to="/bookings"><FontAwesomeIcon icon={faCalendarCheck} /> Xem booking</Link></div><Row className="g-4"><Col lg={3}><Card className="account-sidebar"><Card.Body><div className="account-profile"><div className="account-avatar">{name.charAt(0)}</div><div><strong>{name}</strong><small>{email}</small></div></div><div className="account-nav">{navItems.map((item) => <Link className={section === item.key ? "active" : ""} key={item.key} to={`/account/${item.key}`}><FontAwesomeIcon icon={item.icon} /><span>{item.label}</span>{item.count && <Badge>{item.count}</Badge>}<FontAwesomeIcon className="account-nav-arrow" icon={faChevronRight} /></Link>)}</div><div className="account-secure"><FontAwesomeIcon icon={faShieldHalved} /><div><strong>Tài khoản an toàn</strong><small>Mật khẩu được cập nhật</small></div></div></Card.Body></Card></Col><Col lg={9}>{section === "profile" && <Card className="account-panel"><Card.Body><div className="account-panel-title"><div><h3>Thông tin cá nhân</h3><p>Cập nhật thông tin để việc đặt phòng nhanh và thuận tiện hơn.</p></div><span className="account-edit"><FontAwesomeIcon icon={faPen} /></span></div><div className="account-form"><Form.Group><Form.Label>Họ và tên</Form.Label><Form.Control value={name} onChange={(event) => setName(event.target.value)} /></Form.Group><Form.Group><Form.Label>Số điện thoại</Form.Label><Form.Control value={phone} onChange={(event) => setPhone(event.target.value)} /></Form.Group><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Form.Group><Form.Group><Form.Label>Địa chỉ</Form.Label><Form.Control placeholder="Nhập địa chỉ liên hệ" /></Form.Group></div><div className="account-panel-footer"><small><FontAwesomeIcon icon={faShieldHalved} /> Thông tin của bạn chỉ dùng để hỗ trợ booking.</small><Button className="account-save" onClick={() => setSaved(true)}>{saved ? "Đã lưu thay đổi" : "Lưu thay đổi"}</Button></div></Card.Body></Card>}{section === "notifications" && <Card className="account-panel"><Card.Body><div className="account-panel-title"><div><h3>Thông báo</h3><p>Cập nhật mới nhất về booking, thanh toán và ưu đãi.</p></div><Badge bg="warning" text="dark">3 chưa đọc</Badge></div><div className="notice-list">{notices.map((notice) => <div className="notice-item" key={notice.title}><span className={`notice-icon ${notice.tone}`}><FontAwesomeIcon icon={notice.icon} /></span><div><strong>{notice.title}</strong><p>{notice.text}</p><small>{notice.time}</small></div><FontAwesomeIcon icon={faChevronRight} className="text-muted" /></div>)}</div></Card.Body></Card>}{section === "payments" && <Card className="account-panel"><Card.Body><div className="account-panel-title"><div><h3>Thanh toán & hoàn tiền</h3><p>Theo dõi trạng thái giao dịch trong các chuyến đi của bạn.</p></div><span className="account-edit"><FontAwesomeIcon icon={faCreditCard} /></span></div><div className="payment-summary"><div><small>Đã thanh toán tháng này</small><strong>3.200.000 đ</strong><span className="text-success">Hoàn tất</span></div><div><small>Hoàn tiền đang xử lý</small><strong>0 đ</strong><span>Không có giao dịch</span></div></div><div className="transaction-row"><span className="transaction-icon"><FontAwesomeIcon icon={faCreditCard} /></span><div><strong>ST-1082 · Stayro Riverside</strong><small>Visa •••• 4242 · 22/09/2026</small></div><Badge bg="success">Thành công</Badge><strong>3.200.000 đ</strong></div></Card.Body></Card>}{section === "reviews" && <Card className="account-panel"><Card.Body><div className="account-panel-title"><div><h3>Đánh giá của tôi</h3><p>Những chia sẻ giúp cộng đồng chọn được chỗ ở tốt hơn.</p></div><Badge bg="light" text="dark">2 đánh giá</Badge></div>{reviews.map((review) => <div className="review-item" key={review.property}><div className="review-property"><span className="review-photo" /><div><strong>{review.property}</strong><small>{review.date}</small></div><div className="review-stars">{Array.from({ length: 5 }).map((_, index) => <FontAwesomeIcon key={index} icon={faStar} className={index < review.rating ? "filled" : ""} />)}</div></div><p>“{review.text}”</p><Button variant="link" className="p-0">Chỉnh sửa đánh giá</Button></div>)}<div className="review-cta"><FontAwesomeIcon icon={faStar} /><div><strong>Bạn vừa check-out?</strong><small>Chia sẻ trải nghiệm để nhận ưu đãi cho chuyến đi tiếp theo.</small></div><Button variant="outline-dark">Viết đánh giá</Button></div></Card.Body></Card>}</Col></Row></main></div>;
};

export default CustomerAccountPage;