import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import CustomerHeader from "../../components/customer/home/CustomerHeader/CustomerHeader";
import { getUser } from "../../utils/auth/auth";

const BookingSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");

  const {
    hotelId,
    rooms = [],
    dates,
    guests,
  } = (location.state as any) || {};

  const user = getUser();

  const parseDate = (value: any) => {
    if (!value) return null;

    if (typeof value === "string") {
      return new Date(value);
    }

    if (typeof value?.toDate === "function") {
      return value.toDate();
    }

    return value instanceof Date ? value : new Date(value);
  };

  const startDate = parseDate(dates?.[0]);
  const endDate = parseDate(dates?.[1]);

  // =========================
  // VALIDATE DATA
  // =========================
  if (
    !rooms ||
    rooms.length === 0 ||
    !startDate ||
    !endDate ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    return (
      <div>
        <CustomerHeader />

        <div
          style={{
            background: "#f8fafc",
            minHeight: "100vh",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              maxWidth: 700,
              margin: "0 auto",
            }}
          >
            <Card
              className="border-0 shadow-sm"
              style={{
                borderRadius: 20,
              }}
            >
              <Card.Body className="text-center p-5">
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: "#fef2f2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: 32,
                  }}
                >
                  !
                </div>

                <h4 className="fw-bold">
                  Không có thông tin đặt phòng
                </h4>

                <p className="text-secondary mb-4">
                  Vui lòng quay lại trang chi tiết phòng
                  và chọn lại ngày cùng số khách.
                </p>

                <Button
                  variant="primary"
                  className="px-4 py-2"
                  style={{
                    borderRadius: 10,
                  }}
                  onClick={() => navigate(-1)}
                >
                  Quay lại
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // CALCULATE
  // =========================

  const nights = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const formatDate = (date: Date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const total = rooms.reduce(
    (sum: number, room: any) => {
      const price =
        Number(
          String(room.price).replace(
            /[^0-9.-]+/g,
            ""
          )
        ) || 0;

      const quantity =
        Number(room.quantity) || 0;

      return sum + price * quantity;
    },
    0
  );

  // Lấy thông tin chung của khách sạn
  const hotelName =
    rooms[0]?.hotelName ||
    rooms[0]?.hotel?.tenKhachSan ||
    rooms[0]?.name?.split(" - ")[0] ||
    "Khách sạn";

  const hotelAddress =
    rooms[0]?.address || "";

  // =========================
  // CONTINUE PAYMENT
  // =========================

  const handleContinuePayment = () => {
    const bookingData = {
      hotelId,
      rooms,
      dates,
      guests,
      maKhuyenMai: promoCode.trim() || null,
    };

    if (user) {
      navigate("/booking/payment", {
        state: bookingData,
      });
      return;
    }

    navigate("/customer-login", {
      state: {
        redirectTo: "/booking/payment",
        bookingData,
      },
    });
  };

  return (
    <div>
      {/* HEADER DÙNG CHUNG */}
      <CustomerHeader />

      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "28px 16px 60px",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
          }}
        >
          {/* =========================
              BREADCRUMB
          ========================= */}

          <div
            className="d-flex align-items-center gap-2 mb-4"
            style={{
              fontSize: 14,
              color: "#64748b",
            }}
          >
            <span
              style={{
                cursor: "pointer",
              }}
              onClick={() => navigate(-1)}
            >
              Chi tiết phòng
            </span>

            <span>›</span>

            <span
              style={{
                color: "#4f46e5",
                fontWeight: 600,
              }}
            >
              Xác nhận đặt phòng
            </span>
          </div>

          {/* =========================
              TITLE
          ========================= */}

          <div className="mb-4">
            <h2
              className="fw-bold mb-2"
              style={{
                color: "#0f172a",
              }}
            >
              Xác nhận đặt phòng
            </h2>

            <p
              className="mb-0"
              style={{
                color: "#64748b",
              }}
            >
              Kiểm tra lại thông tin phòng và thời gian
              lưu trú trước khi thanh toán.
            </p>
          </div>

          <Row className="g-4">
            {/* =================================================
                LEFT
            ================================================= */}

            <Col lg={8}>
              {/* =========================
                  HOTEL INFO
              ========================= */}

              <Card
                className="border-0 shadow-sm mb-4"
                style={{
                  borderRadius: 18,
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: "#eef2ff",
                        color: "#4f46e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      🏨
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          marginBottom: 4,
                        }}
                      >
                        KHÁCH SẠN
                      </div>

                      <h5
                        className="fw-bold mb-1"
                        style={{
                          color: "#0f172a",
                        }}
                      >
                        {hotelName}
                      </h5>

                      {hotelAddress && (
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 14,
                          }}
                        >
                          📍 {hotelAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* =========================
                  STAY INFORMATION
              ========================= */}

              <Card
                className="border-0 shadow-sm mb-4"
                style={{
                  borderRadius: 18,
                }}
              >
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">
                    Thông tin lưu trú
                  </h5>

                  <Row className="g-3">
                    <Col xs={12} md={6}>
                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: 14,
                          padding: 16,
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            marginBottom: 6,
                          }}
                        >
                          NHẬN PHÒNG
                        </div>

                        <div
                          className="fw-bold"
                          style={{
                            fontSize: 17,
                            color: "#0f172a",
                          }}
                        >
                          {formatDate(startDate)}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            marginTop: 4,
                          }}
                        >
                          Check-in
                        </div>
                      </div>
                    </Col>

                    <Col xs={12} md={6}>
                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: 14,
                          padding: 16,
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            marginBottom: 6,
                          }}
                        >
                          TRẢ PHÒNG
                        </div>

                        <div
                          className="fw-bold"
                          style={{
                            fontSize: 17,
                            color: "#0f172a",
                          }}
                        >
                          {formatDate(endDate)}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            marginTop: 4,
                          }}
                        >
                          Check-out
                        </div>
                      </div>
                    </Col>

                    <Col xs={6} md={4}>
                      <div
                        style={{
                          padding: "12px 4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                          }}
                        >
                          SỐ ĐÊM
                        </div>

                        <div className="fw-bold mt-1">
                          {nights} đêm
                        </div>
                      </div>
                    </Col>

                    <Col xs={6} md={4}>
                      <div
                        style={{
                          padding: "12px 4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                          }}
                        >
                          KHÁCH
                        </div>

                        <div className="fw-bold mt-1">
                          {guests} khách
                        </div>
                      </div>
                    </Col>

                    <Col xs={12} md={4}>
                      <div
                        style={{
                          padding: "12px 4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                          }}
                        >
                          LOẠI ĐẶT PHÒNG
                        </div>

                        <div className="fw-bold mt-1">
                          {rooms.length} loại phòng
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* =========================
                  ROOM LIST
              ========================= */}

              <Card
                className="border-0 shadow-sm"
                style={{
                  borderRadius: 18,
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                      Phòng đã chọn
                    </h5>

                    <Badge
                      bg="light"
                      text="dark"
                      style={{
                        border: "1px solid #e2e8f0",
                        padding: "8px 12px",
                        borderRadius: 20,
                      }}
                    >
                      {rooms.length} loại phòng
                    </Badge>
                  </div>

                  {rooms.map((room: any, index: number) => {
                    const price =
                      Number(
                        String(room.price).replace(
                          /[^0-9.-]+/g,
                          ""
                        )
                      ) || 0;

                    const quantity =
                      Number(room.quantity) || 0;

                    const roomTotal =
                      price * quantity;

                    return (
                      <div key={room.id}>
                        <div
                          style={{
                            display: "flex",
                            gap: 20,
                            alignItems: "flex-start",
                          }}
                        >
                          {/* IMAGE */}

                          <img
                            src={room.image}
                            alt={room.name}
                            style={{
                              width: 150,
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 14,
                              flexShrink: 0,
                            }}
                          />

                          {/* INFO */}

                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <div className="d-flex justify-content-between gap-3">
                              <div>
                                <h6
                                  className="fw-bold mb-1"
                                  style={{
                                    color: "#0f172a",
                                  }}
                                >
                                  {room.name}
                                </h6>

                                <div
                                  style={{
                                    fontSize: 14,
                                    color: "#64748b",
                                  }}
                                >
                                  {room.address}
                                </div>
                              </div>

                              <Badge
                                bg="light"
                                text="dark"
                                style={{
                                  height: "fit-content",
                                  border:
                                    "1px solid #e2e8f0",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                x{quantity}
                              </Badge>
                            </div>

                            <div
                              className="mt-3"
                              style={{
                                fontSize: 14,
                                color: "#64748b",
                              }}
                            >
                              {price.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND / đêm
                            </div>

                            <div className="mt-2">
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#64748b",
                                }}
                              >
                                Thành tiền
                              </span>

                              <div
                                className="fw-bold"
                                style={{
                                  color: "#dc2626",
                                  fontSize: 17,
                                }}
                              >
                                {roomTotal.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VND
                              </div>
                            </div>
                          </div>
                        </div>

                        {index <
                          rooms.length - 1 && (
                          <hr
                            style={{
                              margin:
                                "24px 0",
                              borderColor:
                                "#e2e8f0",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            </Col>

            {/* =================================================
                RIGHT - BOOKING SUMMARY
            ================================================= */}

            <Col lg={4}>
              <div
                style={{
                  position: "sticky",
                  top: 20,
                }}
              >
                <Card
                  className="border-0 shadow-sm"
                  style={{
                    borderRadius: 18,
                  }}
                >
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4">
                      Chi tiết thanh toán
                    </h5>

                    <div
                      className="d-flex justify-content-between mb-3"
                    >
                      <span
                        style={{
                          color: "#64748b",
                        }}
                      >
                        {rooms.length} loại phòng
                      </span>

                      <strong>
                        {total.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND
                      </strong>
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="booking-promo-code">Mã khuyến mãi (không bắt buộc)</label>
                      <input
                        id="booking-promo-code"
                        className="form-control"
                        value={promoCode}
                        onChange={(event) => setPromoCode(event.target.value)}
                        maxLength={64}
                      />
                    </div>

                    <div
                      className="d-flex justify-content-between mb-3"
                    >
                      <span
                        style={{
                          color: "#64748b",
                        }}
                      >
                        Số đêm
                      </span>

                      <strong>
                        {nights} đêm
                      </strong>
                    </div>

                    <div
                      className="d-flex justify-content-between mb-3"
                    >
                      <span
                        style={{
                          color: "#64748b",
                        }}
                      >
                        Số khách
                      </span>

                      <strong>
                        {guests} khách
                      </strong>
                    </div>

                    <hr />

                    <div
                      className="d-flex justify-content-between align-items-end mb-4"
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#64748b",
                          }}
                        >
                          Tổng thanh toán
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: "#94a3b8",
                          }}
                        >
                          Đã bao gồm tiền phòng
                        </div>
                      </div>

                      <div
                        className="fw-bold text-danger"
                        style={{
                          fontSize: 22,
                        }}
                      >
                        {total.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-100 py-3"
                      style={{
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: 16,
                      }}
                      onClick={
                        handleContinuePayment
                      }
                    >
                      Tiếp tục thanh toán
                    </Button>

                    <Button
                      variant="light"
                      className="w-100 mt-2 py-2"
                      style={{
                        borderRadius: 12,
                        border:
                          "1px solid #e2e8f0",
                      }}
                      onClick={() =>
                        navigate(-1)
                      }
                    >
                      ← Quay lại chọn phòng
                    </Button>

                    {!user && (
                      <div
                        className="mt-3 p-3"
                        style={{
                          background: "#eff6ff",
                          borderRadius: 12,
                          fontSize: 13,
                          color: "#475569",
                        }}
                      >
                        💡 Bạn cần đăng nhập để
                        tiếp tục thanh toán.
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* =========================
                    POLICY
                ========================= */}

                <Card
                  className="border-0 shadow-sm mt-4"
                  style={{
                    borderRadius: 18,
                  }}
                >
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-3">
                      Chính sách đặt phòng
                    </h6>

                    <div
                      className="d-flex gap-2 mb-3"
                      style={{
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      <span>✓</span>
                      <span>
                        Kiểm tra kỹ ngày nhận và
                        ngày trả phòng.
                      </span>
                    </div>

                    <div
                      className="d-flex gap-2 mb-3"
                      style={{
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      <span>✓</span>
                      <span>
                        Thông tin đặt phòng sẽ được
                        xác nhận sau khi hoàn tất.
                      </span>
                    </div>

                    <div
                      className="d-flex gap-2"
                      style={{
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      <span>✓</span>
                      <span>
                        Thanh toán khi nhận phòng
                        được hỗ trợ.
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryPage;