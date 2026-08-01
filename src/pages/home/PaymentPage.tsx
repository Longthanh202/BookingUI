import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import HomeHeader from "../../components/home/home-page/HomeHeader/HomeHeader";
import { createBooking } from "../../api/booking/booking.api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, dates, guests } = (location.state as any) || {};
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | "pay_on_arrival">("card");
  const [loading, setLoading] = useState(false);

  const parseDate = (value: any) => {
    if (!value) return null;
    if (typeof value === "string") return new Date(value);
    if (typeof value?.toDate === "function") return value.toDate();
    return value instanceof Date ? value : new Date(value);
  };

  const startDate = parseDate(dates?.[0]);
  const endDate = parseDate(dates?.[1]);

  if (!room || !startDate || !endDate) {
    return (
      <div style={{ padding: 24 }}>
        <HomeHeader />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Card style={{ borderRadius: 16 }}>
            <Card.Body>
              <h4>Không có thông tin thanh toán</h4>
              <p>Vui lòng quay lại trang đặt phòng và chọn lại thông tin.</p>
              <div style={{ marginTop: 24 }}>
                <Button variant="primary" onClick={() => navigate(-1)}>
                  Quay lại đặt phòng
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  const nights = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const priceNumber = Number(String(room.price).replace(/[^0-9.-]+/g, "")) || 0;
  const total = priceNumber * nights;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handlePayment = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const payload = {
        roomId: room.id,
        roomName: room.name,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        guests: guests || 1,
        totalAmount: total,
        paymentMethod,
        paymentStatus: paymentMethod === "pay_on_arrival" ? "pending" : "paid",
      };

      await createBooking(payload as any);
      window.alert("Thanh toán thành công và đặt phòng thành công");
      navigate("/bookings");
    } catch (error) {
      console.error(error);
      window.alert("Thanh toán thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <HomeHeader />
      <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 24 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Card style={{ borderRadius: 16, marginBottom: 24 }}>
            <Card.Body>
              <h4>Thanh toán đặt phòng</h4>
              <p className="text-secondary">
                Kiểm tra lại thông tin đặt phòng và chọn phương thức thanh toán phù hợp.
              </p>
              <hr />
              <Row className="g-4">
                <Col xs={12} md={4}>
                  <img
                    src={room.image}
                    alt={room.name}
                    style={{ width: "100%", borderRadius: 16, objectFit: "cover", minHeight: 220 }}
                  />
                </Col>
                <Col xs={12} md={8}>
                  <div className="mb-3">
                    <strong>{room.name}</strong>
                    <div className="text-secondary">{room.address}</div>
                  </div>
                  <div className="mb-2">
                    <div>Ngày nhận:</div>
                    <strong>{formatDate(startDate)}</strong>
                  </div>
                  <div className="mb-2">
                    <div>Ngày trả:</div>
                    <strong>{formatDate(endDate)}</strong>
                  </div>
                  <div className="mb-2">
                    <div>Số đêm:</div>
                    <strong>{nights}</strong>
                  </div>
                  <div className="mb-2">
                    <div>Khách:</div>
                    <strong>{guests}</strong>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div>Giá mỗi đêm:</div>
                    <strong>{room.price}</strong>
                  </div>
                  <div style={{ marginTop: 12, padding: 16, background: "#f3f4f6", borderRadius: 12 }}>
                    <p className="text-secondary mb-1">Tổng thanh toán</p>
                    <h2 className="mb-0">{total.toLocaleString()} VND</h2>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card style={{ borderRadius: 16 }}>
            <Card.Body>
              <h5>Thông tin thanh toán</h5>
              <Form>
                <Form.Check
                  type="radio"
                  label="Thanh toán bằng thẻ"
                  name="paymentMethod"
                  id="payment-card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <Form.Check
                  type="radio"
                  label="Thanh toán bằng mã QR"
                  name="paymentMethod"
                  id="payment-qr"
                  checked={paymentMethod === "qr"}
                  onChange={() => setPaymentMethod("qr")}
                />
                <Form.Check
                  type="radio"
                  label="Thanh toán khi nhận phòng"
                  name="paymentMethod"
                  id="payment-arrival"
                  checked={paymentMethod === "pay_on_arrival"}
                  onChange={() => setPaymentMethod("pay_on_arrival")}
                />
              </Form>

              {paymentMethod === "card" && (
                <Form style={{ marginTop: 24 }}>
                  <Row className="g-3">
                    <Col xs={12} md={6}>
                      <Form.Group controlId="cardName">
                        <Form.Label>Tên chủ thẻ</Form.Label>
                        <Form.Control type="text" placeholder="Nguyễn Văn A" required />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="cardNumber">
                        <Form.Label>Số thẻ</Form.Label>
                        <Form.Control type="text" placeholder="1234 5678 9012 3456" maxLength={19} required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="g-3 mt-2">
                    <Col xs={6}>
                      <Form.Group controlId="expiry">
                        <Form.Label>Hạn sử dụng</Form.Label>
                        <Form.Control type="text" placeholder="MM/YY" required />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group controlId="cvv">
                        <Form.Label>CVV</Form.Label>
                        <Form.Control type="text" placeholder="123" maxLength={4} required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    className="mt-4"
                    variant="primary"
                    disabled={loading}
                    onClick={handlePayment}
                  >
                    {loading ? "Đang xử lý..." : `Thanh toán ${total.toLocaleString()} VND`}
                  </Button>
                </Form>
              )}

              {paymentMethod === "qr" && (
                <div style={{ marginTop: 24 }}>
                  <div className="d-flex justify-content-center mb-4">
                    <div
                      style={{
                        width: 220,
                        height: 220,
                        background: "#fff",
                        borderRadius: 16,
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      }}
                    >
                      <span className="text-secondary">Mã QR thanh toán</span>
                    </div>
                  </div>
                  <Button variant="primary" disabled={loading} onClick={handlePayment}>
                    {loading ? "Đang xử lý..." : "Xác nhận thanh toán QR"}
                  </Button>
                </div>
              )}

              {paymentMethod === "pay_on_arrival" && (
                <div style={{ marginTop: 24 }}>
                  <p>
                    Bạn sẽ thanh toán trực tiếp khi đến nhận phòng. Vui lòng kiểm tra lại thông tin
                    và tiếp tục đặt phòng.
                  </p>
                  <Button variant="primary" disabled={loading} onClick={handlePayment}>
                    {loading ? "Đang xử lý..." : "Hoàn tất đặt phòng"}
                  </Button>
                </div>
              )}

              <hr />
              <div className="d-flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Quay lại
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate(`/rooms/${room.id}`)}>
                  Quay lại chi tiết phòng
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
