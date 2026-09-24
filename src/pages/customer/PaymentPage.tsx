import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import CustomerHeader from "../../components/customer/home/CustomerHeader/CustomerHeader";
import { createBooking } from "../../api/booking/booking.api";
import { showToast } from "../../components/common/Toast";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    hotelId,
    rooms = [],
    dates,
    guests,
  } = (location.state as any) || {};

  console.log("PaymentPage location.state:", location.state);

  const [paymentMethod, setPaymentMethod] =
    useState<"card" | "qr" | "pay_on_arrival">("card");

  const [loading, setLoading] = useState(false);

  // =========================
  // DATE
  // =========================

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
  // VALIDATE
  // =========================

  if (
    !rooms ||
    rooms.length === 0 ||
    !startDate ||
    !endDate
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
              maxWidth: 650,
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
                    fontSize: 30,
                    fontWeight: 700,
                  }}
                >
                  !
                </div>

                <h4 className="fw-bold mb-2">
                  Không có thông tin thanh toán
                </h4>

                <p className="text-secondary mb-4">
                  Phiên đặt phòng không còn tồn tại hoặc
                  thông tin đặt phòng chưa đầy đủ.
                </p>

                <Button
                  variant="primary"
                  className="px-4"
                  style={{
                    borderRadius: 10,
                  }}
                  onClick={() => navigate(-1)}
                >
                  Quay lại đặt phòng
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

  const getPrice = (room: any) => {
    return (
      Number(
        String(room.price).replace(
          /[^0-9.-]+/g,
          ""
        )
      ) || 0
    );
  };

  const total = rooms.reduce(
    (sum: number, room: any) => {
      const price = getPrice(room);

      const quantity =
        Number(room.quantity) || 0;

      return sum + price * quantity;
    },
    0
  );

  const totalRooms = rooms.reduce(
    (sum: number, room: any) =>
      sum + (Number(room.quantity) || 0),
    0
  );

  const formatDate = (date: Date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // =========================
  // PAYMENT
  // =========================

  const handlePayment = async () => {
    if (!hotelId) {
      showToast("Không xác định được khách sạn.", "error");
      return;
    }

    if (!rooms || rooms.length === 0) {
      showToast("Chưa có phòng được chọn.", "info");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        khachSanId: hotelId,

        ngayNhanPhong: startDate.toISOString(),

        ngayTraPhong: endDate.toISOString(),

        phuongThucThanhToan:
          paymentMethod === "card"
            ? "CARD"
            : paymentMethod === "qr"
            ? "MOMO"
            : "TIEN_MAT",

        danhSachPhong: rooms.map((room: any) => ({
          loaiPhongId: room.id,
          soLuong: Number(room.quantity),
        })),
      };

      console.log(
        "Create booking payload:",
        payload
      );

      await createBooking(payload as any);

      showToast(
        "Đặt phòng thành công!"
      );

      navigate("/bookings");
    } catch (error) {
      console.error(error);

      showToast(
        "Thanh toán thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PAYMENT METHOD
  // =========================

  const PaymentMethodCard = ({
    value,
    icon,
    title,
    description,
  }: {
    value:
      | "card"
      | "qr"
      | "pay_on_arrival";
    icon: string;
    title: string;
    description: string;
  }) => {
    const selected =
      paymentMethod === value;

    return (
      <div
        onClick={() =>
          setPaymentMethod(value)
        }
        style={{
          border: selected
            ? "2px solid #4f46e5"
            : "1px solid #e2e8f0",

          background: selected
            ? "#eef2ff"
            : "#ffffff",

          borderRadius: 14,
          padding: "15px 16px",
          cursor: "pointer",
          transition: "all .2s ease",
          marginBottom: 12,
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: selected
                ? "#4f46e5"
                : "#f1f5f9",
              color: selected
                ? "#fff"
                : "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div style={{ flex: 1 }}>
            <div
              className="fw-semibold"
              style={{
                color: "#0f172a",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginTop: 3,
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: selected
                ? "6px solid #4f46e5"
                : "2px solid #cbd5e1",
              flexShrink: 0,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* =========================
          HEADER
      ========================= */}

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
              Xác nhận đặt phòng
            </span>

            <span>›</span>

            <span
              style={{
                color: "#4f46e5",
                fontWeight: 600,
              }}
            >
              Thanh toán
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
              Thanh toán đặt phòng
            </h2>

            <p
              className="mb-0"
              style={{
                color: "#64748b",
              }}
            >
              Chọn phương thức thanh toán và hoàn tất
              đặt phòng của bạn.
            </p>
          </div>

          <Row className="g-4">
            {/* =================================================
                LEFT
            ================================================= */}

            <Col lg={7}>
              {/* =========================
                  BOOKING INFO
              ========================= */}

              <Card
                className="border-0 shadow-sm mb-4"
                style={{
                  borderRadius: 18,
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="fw-bold mb-1">
                        Thông tin đặt phòng
                      </h5>

                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                        }}
                      >
                        Kiểm tra lại trước khi thanh toán
                      </span>
                    </div>

                    <Badge
                      bg="light"
                      text="dark"
                      style={{
                        border:
                          "1px solid #e2e8f0",
                        padding: "8px 12px",
                        borderRadius: 20,
                      }}
                    >
                      {totalRooms} phòng
                    </Badge>
                  </div>

                  {/* DATE */}

                  <Row className="g-3 mb-4">
                    <Col xs={6}>
                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: 14,
                          padding: 15,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginBottom: 5,
                          }}
                        >
                          NGÀY NHẬN
                        </div>

                        <div className="fw-bold">
                          {formatDate(startDate)}
                        </div>
                      </div>
                    </Col>

                    <Col xs={6}>
                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: 14,
                          padding: 15,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginBottom: 5,
                          }}
                        >
                          NGÀY TRẢ
                        </div>

                        <div className="fw-bold">
                          {formatDate(endDate)}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* ROOMS */}

                  {rooms.map(
                    (room: any, index: number) => {
                      const price =
                        getPrice(room);

                      const quantity =
                        Number(room.quantity) ||
                        0;

                      const roomTotal =
                        price * quantity;

                      return (
                        <div key={room.id}>
                          <div
                            style={{
                              display: "flex",
                              gap: 16,
                            }}
                          >
                            <img
                              src={room.image}
                              alt={room.name}
                              style={{
                                width: 130,
                                height: 105,
                                borderRadius: 14,
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />

                            <div
                              style={{
                                flex: 1,
                              }}
                            >
                              <div className="d-flex justify-content-between gap-2">
                                <div>
                                  <h6
                                    className="fw-bold mb-1"
                                    style={{
                                      color:
                                        "#0f172a",
                                    }}
                                  >
                                    {room.name}
                                  </h6>

                                  <div
                                    style={{
                                      fontSize: 13,
                                      color:
                                        "#64748b",
                                    }}
                                  >
                                    {room.address}
                                  </div>
                                </div>

                                <Badge
                                  bg="light"
                                  text="dark"
                                  style={{
                                    height:
                                      "fit-content",
                                    border:
                                      "1px solid #e2e8f0",
                                  }}
                                >
                                  x{quantity}
                                </Badge>
                              </div>

                              <div className="mt-3">
                                <div
                                  style={{
                                    fontSize: 13,
                                    color:
                                      "#64748b",
                                  }}
                                >
                                  {price.toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  VND / đêm
                                </div>

                                <div
                                  className="fw-bold mt-1"
                                  style={{
                                    color:
                                      "#dc2626",
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
                                  "22px 0",
                                borderColor:
                                  "#e2e8f0",
                              }}
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </Card.Body>
              </Card>

              {/* =========================
                  PAYMENT METHODS
              ========================= */}

              <Card
                className="border-0 shadow-sm"
                style={{
                  borderRadius: 18,
                }}
              >
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-1">
                    Phương thức thanh toán
                  </h5>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                    }}
                    className="mb-4"
                  >
                    Chọn phương thức bạn muốn sử dụng
                  </p>

                  <PaymentMethodCard
                    value="card"
                    icon="💳"
                    title="Thanh toán bằng thẻ"
                    description="Visa, Mastercard hoặc thẻ ngân hàng"
                  />

                  <PaymentMethodCard
                    value="qr"
                    icon="▣"
                    title="Thanh toán bằng QR"
                    description="Quét mã QR để thanh toán nhanh"
                  />

                  <PaymentMethodCard
                    value="pay_on_arrival"
                    icon="🏨"
                    title="Thanh toán khi nhận phòng"
                    description="Thanh toán trực tiếp tại khách sạn"
                  />

                  {/* =========================
                      CARD FORM
                  ========================= */}

                  {paymentMethod ===
                    "card" && (
                    <div
                      style={{
                        marginTop: 24,
                        padding: 20,
                        background: "#f8fafc",
                        borderRadius: 16,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">
                          Thông tin thẻ
                        </h6>

                        <span
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          🔒 Bảo mật
                        </span>
                      </div>

                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Tên chủ thẻ
                          </Form.Label>

                          <Form.Control
                            type="text"
                            placeholder="NGUYEN VAN A"
                            style={{
                              borderRadius: 10,
                              padding: 11,
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            Số thẻ
                          </Form.Label>

                          <Form.Control
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            style={{
                              borderRadius: 10,
                              padding: 11,
                            }}
                          />
                        </Form.Group>

                        <Row className="g-3">
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label>
                                Hạn sử dụng
                              </Form.Label>

                              <Form.Control
                                type="text"
                                placeholder="MM/YY"
                                style={{
                                  borderRadius: 10,
                                  padding: 11,
                                }}
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label>
                                CVV
                              </Form.Label>

                              <Form.Control
                                type="password"
                                placeholder="•••"
                                maxLength={4}
                                style={{
                                  borderRadius: 10,
                                  padding: 11,
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  )}

                  {/* =========================
                      QR
                  ========================= */}

                  {paymentMethod ===
                    "qr" && (
                    <div
                      style={{
                        marginTop: 24,
                        padding: 25,
                        background: "#f8fafc",
                        borderRadius: 16,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 5,
                        }}
                      >
                        Quét mã QR để thanh toán
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          marginBottom: 20,
                        }}
                      >
                        Số tiền cần thanh toán
                      </div>

                      <div
                        style={{
                          width: 210,
                          height: 210,
                          background: "#fff",
                          borderRadius: 16,
                          margin: "0 auto 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          border:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "center",
                            color: "#64748b",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 50,
                              marginBottom: 10,
                            }}
                          >
                            ▦
                          </div>

                          <span
                            style={{
                              fontSize: 13,
                            }}
                          >
                            Mã QR thanh toán
                          </span>
                        </div>
                      </div>

                      <div
                        className="fw-bold text-danger"
                        style={{
                          fontSize: 20,
                        }}
                      >
                        {total.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND
                      </div>
                    </div>
                  )}

                  {/* =========================
                      PAY ON ARRIVAL
                  ========================= */}

                  {paymentMethod ===
                    "pay_on_arrival" && (
                    <div
                      style={{
                        marginTop: 24,
                        padding: 20,
                        background: "#fffbeb",
                        border:
                          "1px solid #fde68a",
                        borderRadius: 16,
                      }}
                    >
                      <div className="d-flex gap-3">
                        <div
                          style={{
                            fontSize: 24,
                          }}
                        >
                          🏨
                        </div>

                        <div>
                          <h6 className="fw-bold">
                            Thanh toán tại khách sạn
                          </h6>

                          <p
                            className="mb-0"
                            style={{
                              fontSize: 13,
                              color:
                                "#92400e",
                              lineHeight: 1.6,
                            }}
                          >
                            Bạn sẽ thanh toán trực
                            tiếp khi đến nhận phòng.
                            Vui lòng đảm bảo thông
                            tin đặt phòng chính xác.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* =================================================
                RIGHT
            ================================================= */}

            <Col lg={5}>
              <div
                style={{
                  position: "sticky",
                  top: 20,
                }}
              >
                {/* =========================
                    SUMMARY
                ========================= */}

                <Card
                  className="border-0 shadow-sm"
                  style={{
                    borderRadius: 18,
                  }}
                >
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4">
                      Tóm tắt thanh toán
                    </h5>

                    <div
                      className="d-flex justify-content-between mb-3"
                    >
                      <span
                        style={{
                          color: "#64748b",
                        }}
                      >
                        Tiền phòng
                      </span>

                      <strong>
                        {total.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND
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
                        Số phòng
                      </span>

                      <strong>
                        {totalRooms}
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

                    <div className="mb-4">
                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                        }}
                      >
                        Tổng thanh toán
                      </div>

                      <div
                        className="fw-bold text-danger"
                        style={{
                          fontSize: 28,
                          marginTop: 5,
                        }}
                      >
                        {total.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND
                      </div>
                    </div>

                    {/* PAYMENT BUTTON */}

                    <Button
                      variant="primary"
                      className="w-100 py-3"
                      disabled={loading}
                      onClick={handlePayment}
                      style={{
                        borderRadius: 12,
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      {loading
                        ? "Đang xử lý..."
                        : paymentMethod ===
                          "pay_on_arrival"
                        ? "Hoàn tất đặt phòng"
                        : `Thanh toán ${total.toLocaleString(
                            "vi-VN"
                          )} VND`}
                    </Button>

                    <Button
                      variant="light"
                      className="w-100 mt-2"
                      onClick={() =>
                        navigate(-1)
                      }
                      style={{
                        borderRadius: 12,
                        border:
                          "1px solid #e2e8f0",
                        padding: 11,
                      }}
                    >
                      ← Quay lại
                    </Button>

                    <div
                      className="text-center mt-3"
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                      }}
                    >
                      🔒 Thông tin thanh toán của bạn
                      được bảo mật.
                    </div>
                  </Card.Body>
                </Card>

                {/* =========================
                    BOOKING PROTECTION
                ========================= */}

                <Card
                  className="border-0 shadow-sm mt-4"
                  style={{
                    borderRadius: 18,
                  }}
                >
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-3">
                      Đặt phòng an toàn
                    </h6>

                    <div
                      className="d-flex gap-3 mb-3"
                      style={{
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      <span>✓</span>

                      <span>
                        Thông tin đặt phòng được lưu
                        và xác nhận sau khi hoàn tất.
                      </span>
                    </div>

                    <div
                      className="d-flex gap-3 mb-3"
                      style={{
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      <span>✓</span>

                      <span>
                        Bạn có thể xem lịch sử đặt phòng
                        sau khi hoàn tất.
                      </span>
                    </div>

                    <div
                      className="d-flex gap-3"
                      style={{
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      <span>✓</span>

                      <span>
                        Hỗ trợ thanh toán trực tuyến và
                        thanh toán tại khách sạn.
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

export default PaymentPage;