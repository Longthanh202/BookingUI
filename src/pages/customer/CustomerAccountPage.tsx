import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCalendarCheck, faChevronRight, faCreditCard, faShieldHalved, faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import { Alert, Badge, Card, Col, Row, Spinner, Table } from "react-bootstrap";
import { useQueries, useQuery } from "@tanstack/react-query";
import CustomerHeader from "../../components/customer/home/CustomerHeader/CustomerHeader";
import { getProfileApi } from "../../api/auth/auth.api";
import { getAllBookingsHistory } from "../../api/booking/booking.api";
import { getMyReviews } from "../../api/review/review.api";
import { getPayment } from "../../api/payment/payment.api";
import { getUser } from "../../utils/auth/auth";
import "../../styles/customer/CustomerAccountPage.css";

type AccountSection = "profile" | "notifications" | "payments" | "reviews";
type CustomerNotification = { id: number; title: string; message: string; receivedAt: string };

const getRows = (response: any): any[] => {
  const value = response?.data ?? response;
  return Array.isArray(value) ? value : value?.items ?? value?.results ?? [];
};
const valueOf = (row: any, ...keys: string[]) =>
  keys.map((key) => row?.[key] ?? row?.[key.charAt(0).toUpperCase() + key.slice(1)])
    .find((value) => value !== undefined && value !== null) ?? "-";

const CustomerAccountPage = () => {
  const user = getUser() as any;
  const accessToken = localStorage.getItem("accessToken");
  const location = useLocation();
  const rawSection = location.pathname.split("/").pop() as AccountSection;
  const section: AccountSection = ["profile", "notifications", "payments", "reviews"].includes(rawSection) ? rawSection : "profile";
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [connectionError, setConnectionError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Chưa kết nối");
  const profile = useQuery({
    queryKey: ["customer-profile"],
    queryFn: getProfileApi,
    enabled: Boolean(user),
  });
  const bookings = useQuery({
    queryKey: ["bookings-history", 1, 50],
    queryFn: () => getAllBookingsHistory(1, 50),
    enabled: Boolean(user),
  });
  const reviews = useQuery({
    queryKey: ["customer-reviews"],
    queryFn: getMyReviews,
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (section !== "notifications" || !accessToken) return;
    let mounted = true;
    const baseUrl = (process.env.REACT_APP_BASE_URL || "http://localhost:5295").replace(/\/+$/, "");
    const connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/bookingHub`, {
        accessTokenFactory: () => localStorage.getItem("accessToken") || "",
      })
      .withAutomaticReconnect()
      .build();
    const receive = (title: string, payload: unknown) => {
      const event = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      const message = [
        event.bookingId || event.id || event.maBooking ? `Booking ${String(event.bookingId ?? event.id ?? event.maBooking)}` : "",
        event.status || event.trangThai ? `Trạng thái: ${String(event.status ?? event.trangThai)}` : "",
      ].filter(Boolean).join(" · ") || "Bạn vừa nhận được cập nhật booking.";
      setNotifications((current) => [
        { id: Date.now() + Math.random(), title, message, receivedAt: new Date().toLocaleString("vi-VN") },
        ...current,
      ]);
    };
    connection.on("BookingSuccess", (payload: unknown) => receive("Đặt phòng thành công", payload));
    connection.on("BookingStatusChanged", (payload: unknown) => receive("Cập nhật trạng thái booking", payload));
    connection.onreconnecting(() => {
      if (mounted) setConnectionStatus("Đang kết nối lại");
    });
    connection.onreconnected(() => {
      if (mounted) {
        setConnectionStatus("Đã kết nối");
        setConnectionError("");
      }
    });
    connection.onclose((error) => {
      if (mounted) {
        setConnectionStatus("Mất kết nối");
        if (error) setConnectionError(error.message);
      }
    });
    connection.start().then(() => {
      if (mounted) setConnectionStatus("Đã kết nối");
    }).catch((error: Error) => {
      if (mounted) {
        setConnectionError(error.message);
        setConnectionStatus("Không kết nối được");
      }
    });
    return () => {
      mounted = false;
      void connection.stop();
    };
  }, [section, accessToken]);

  const profileData = (profile.data as any)?.data ?? profile.data ?? {};
  const bookingRows = getRows(bookings.data);
  const reviewRows = getRows(reviews.data);
  const paymentRows = bookingRows
    .map((booking: any) => ({ booking, paymentId: valueOf(booking, "paymentId", "thanhToanId") }))
    .filter(({ paymentId }) => paymentId !== "-");
  const paymentDetails = useQueries({
    queries: paymentRows.map(({ paymentId }) => ({
      queryKey: ["customer-payment", paymentId],
      queryFn: () => getPayment(paymentId),
      enabled: Boolean(user),
    })),
  });
  const displayName = valueOf(profileData, "fullName", "hoTen", "username");
  const email = valueOf(profileData, "email");

  const navItems = [
    { key: "profile", label: "Thông tin cá nhân", icon: faUser },
    { key: "notifications", label: "Thông báo", icon: faBell },
    { key: "payments", label: "Thanh toán", icon: faCreditCard },
    { key: "reviews", label: "Đánh giá của tôi", icon: faStar },
  ];

  return (
    <div className="account-page">
      <CustomerHeader />
      <main className="account-container">
        <div className="account-intro">
          <div><div className="account-kicker">MY STAYRO</div><h1>Tài khoản của tôi</h1><p>Thông tin và hoạt động liên quan đến tài khoản của bạn.</p></div>
          <Link className="account-bookings" to="/bookings"><FontAwesomeIcon icon={faCalendarCheck} /> Xem booking</Link>
        </div>
        <Row className="g-4">
          <Col lg={3}>
            <Card className="account-sidebar"><Card.Body>
              <div className="account-profile">
                <div className="account-avatar">{displayName === "-" ? "?" : displayName.charAt(0)}</div>
                <div><strong>{displayName}</strong><small>{email}</small></div>
              </div>
              <div className="account-nav">
                {navItems.map((item) => <Link className={section === item.key ? "active" : ""} key={item.key} to={`/account/${item.key}`}><FontAwesomeIcon icon={item.icon} /><span>{item.label}</span><FontAwesomeIcon className="account-nav-arrow" icon={faChevronRight} /></Link>)}
              </div>
              <div className="account-secure"><FontAwesomeIcon icon={faShieldHalved} /><div><strong>Dữ liệu tài khoản</strong><small>Lấy từ hồ sơ đã đăng nhập</small></div></div>
            </Card.Body></Card>
          </Col>
          <Col lg={9}>
            {section === "profile" && <Card className="account-panel"><Card.Body>
              <div className="account-panel-title"><div><h3>Thông tin cá nhân</h3><p>Hồ sơ hiện tại của bạn từ hệ thống.</p></div></div>
              {profile.isLoading ? <Spinner animation="border" /> : profile.isError ? <Alert variant="danger">Không thể tải hồ sơ tài khoản.</Alert> : (
                <Table responsive className="align-middle mb-0"><tbody>
                  <tr><th>Họ và tên</th><td>{valueOf(profileData, "fullName", "hoTen")}</td></tr>
                  <tr><th>Tên đăng nhập</th><td>{valueOf(profileData, "username", "userName")}</td></tr>
                  <tr><th>Email</th><td>{valueOf(profileData, "email")}</td></tr>
                  <tr><th>Số điện thoại</th><td>{valueOf(profileData, "phone", "soDienThoai")}</td></tr>
                  <tr><th>Địa chỉ</th><td>{valueOf(profileData, "address", "diaChi")}</td></tr>
                </tbody></Table>
              )}
              <small className="text-muted d-block mt-3">Backend hiện chưa có endpoint cập nhật hồ sơ Customer.</small>
            </Card.Body></Card>}
            {section === "notifications" && <Card className="account-panel"><Card.Body>
              <div className="account-panel-title"><div><h3>Thông báo booking</h3><p>Sự kiện realtime từ bookingHub trong phiên này.</p></div><Badge bg={connectionStatus === "Đã kết nối" ? "success" : "secondary"}>{connectionStatus}</Badge></div>
              {connectionError && <Alert variant="warning">Không thể kết nối bookingHub: {connectionError}</Alert>}
              {!notifications.length ? <p className="text-muted mb-0">Chưa nhận được thông báo realtime trong phiên này.</p> : notifications.map((notice) => <div className="notice-item" key={notice.id}><span className="notice-icon orange"><FontAwesomeIcon icon={faBell} /></span><div><strong>{notice.title}</strong><p>{notice.message}</p><small>{notice.receivedAt}</small></div></div>)}
            </Card.Body></Card>}
            {section === "payments" && <Card className="account-panel"><Card.Body>
              <div className="account-panel-title"><div><h3>Thanh toán</h3><p>Chi tiết thanh toán lấy từ API payment của booking thuộc tài khoản.</p></div></div>
              {bookings.isLoading ? <Spinner animation="border" /> : bookings.isError ? <Alert variant="danger">Không thể tải lịch sử booking.</Alert> : paymentRows.length ? <Table responsive className="align-middle"><thead><tr><th>Booking</th><th>Payment</th><th>Số tiền</th><th>Trạng thái</th></tr></thead><tbody>
                {paymentRows.map(({ booking, paymentId }, index) => {
                  const payment = (paymentDetails[index]?.data as any)?.data ?? paymentDetails[index]?.data;
                  return <tr key={String(valueOf(booking, "id") || index)}><td>{valueOf(booking, "id")}</td><td>{paymentId}</td><td>{payment ? valueOf(payment, "amount", "soTien") : paymentDetails[index]?.isLoading ? "Đang tải..." : "-"}</td><td>{payment ? valueOf(payment, "status", "trangThai") : paymentDetails[index]?.isError ? "Không thể tải" : "-"}</td></tr>;
                })}
              </tbody></Table> : <p className="text-muted mb-0">Lịch sử booking chưa cung cấp paymentId để tra cứu chi tiết thanh toán.</p>}
            </Card.Body></Card>}
            {section === "reviews" && <Card className="account-panel"><Card.Body>
              <div className="account-panel-title"><div><h3>Đánh giá của tôi</h3><p>Review đã gửi bằng tài khoản hiện tại.</p></div></div>
              {reviews.isLoading ? <Spinner animation="border" /> : reviews.isError ? <Alert variant="danger">Không thể tải đánh giá.</Alert> : reviewRows.length ? reviewRows.map((review: any, index: number) => <div className="review-item" key={String(valueOf(review, "id", "reviewId") || index)}><div className="review-property"><div><strong>{valueOf(review, "tenKhachSan", "hotelName")}</strong><small>{valueOf(review, "createdAt")}</small></div><Badge bg="warning" text="dark">{valueOf(review, "soSao", "rating")} ★</Badge></div><p>{valueOf(review, "noiDung", "content")}</p></div>) : <p className="text-muted mb-0">Bạn chưa có đánh giá nào.</p>}
            </Card.Body></Card>}
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default CustomerAccountPage;
