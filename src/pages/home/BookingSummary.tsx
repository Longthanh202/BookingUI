import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import HomeHeader from "../../components/home/home-page/HomeHeader/HomeHeader";

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, dates, guests } = (location.state as any) || {};

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
              <h4>Không có thông tin đặt phòng</h4>
              <p>Vui lòng quay lại chi tiết phòng và chọn lại ngày cùng số khách.</p>
              <div style={{ marginTop: 24 }}>
                <Button variant="primary" onClick={() => navigate(-1)}>
                  Quay lại
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

  return (
    <div>
      <HomeHeader />
      <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 24 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Card style={{ borderRadius: 16, marginBottom: 24 }}>
            <Card.Body>
              <h4>Xác nhận thông tin đặt phòng</h4>
              <p className="text-secondary">
                Kiểm tra lại phòng, thời gian và số khách trước khi chuyển sang thanh toán.
              </p>
              <hr />
              <Row className="g-4">
                <Col xs={12} md={4}>
                  <img
                    src={room.image}
                    alt={room.name}
                    style={{ width: "100%", minHeight: 220, objectFit: "cover", borderRadius: 16 }}
                  />
                </Col>
                <Col xs={12} md={8}>
                  <div className="mb-3">
                    <strong>{room.name}</strong>
                    <div className="text-secondary">{room.address}</div>
                  </div>
                  <div className="mb-2">
                    <div>Thời gian lưu trú:</div>
                    <strong>{formatDate(startDate)} - {formatDate(endDate)}</strong>
                  </div>
                  <div className="mb-2">
                    <div>Số đêm:</div>
                    <strong>{nights}</strong>
                  </div>
                  <div className="mb-2">
                    <div>Khách:</div>
                    <strong>{guests}</strong>
                  </div>
                  <div>
                    <div>Giá mỗi đêm:</div>
                    <strong>{room.price}</strong>
                  </div>
                </Col>
              </Row>
              <hr />
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div>
                  <p className="text-secondary mb-1">Tổng số tiền</p>
                  <h2 className="mb-0">{total.toLocaleString()} VND</h2>
                </div>
                <Button
                  variant="primary"
                  onClick={() =>
                    navigate("/booking/payment", {
                      state: { room, dates, guests },
                    })
                  }
                >
                  Tiếp tục thanh toán
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card style={{ borderRadius: 16 }}>
            <Card.Body>
              <h5>Lưu ý</h5>
              <ul style={{ margin: 0, paddingLeft: 20, color: "#475569" }}>
                <li>Đảm bảo thông tin phòng và thời gian lưu trú đã chính xác.</li>
                <li>Thanh toán trực tuyến sẽ được xác nhận ngay lập tức.</li>
                <li>Thanh toán khi nhận phòng sẽ giữ phòng và xác nhận sau khi nhận.</li>
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
