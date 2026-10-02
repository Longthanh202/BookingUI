import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import CustomerHeader from "../../components/customer/home/CustomerHeader/CustomerHeader";
import { createBooking } from "../../api/booking/booking.api";
import { BookingQrPayment, getBookingQr } from "../../api/payment/payment.api";
import { showToast } from "../../components/common/Toast";
import { BookingRequest } from "../../types/booking/BookingRequest";

const extractBookingId = (response: any): string => {
  const candidates = [
    response?.bookingId,
    response?.id,
    response?.datPhongId,
    response?.idDatPhong,
    response?.booking?.bookingId,
    response?.booking?.id,
    response?.datPhong?.bookingId,
    response?.datPhong?.id,
    response?.data?.bookingId,
    response?.data?.id,
    response?.data?.datPhongId,
    response?.data?.idDatPhong,
    response?.data?.booking?.bookingId,
    response?.data?.booking?.id,
    response?.data?.datPhong?.bookingId,
    response?.data?.datPhong?.id,
    response?.data?.data?.bookingId,
    response?.data?.data?.id,
    response?.result?.bookingId,
    response?.result?.id,
  ];

  const bookingId = candidates.find(
    (value) => value !== undefined && value !== null && String(value).trim()
  );

  return bookingId === undefined ? "" : String(bookingId).trim();
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    hotelId,
    rooms = [],
    dates,
    guests,
    maKhuyenMai,
  } = (location.state as any) || {};

  const [paymentMethod, setPaymentMethod] =
    useState<"cash" | "qr">("cash");

  const [loading, setLoading] = useState(false);
  const [qrPayment, setQrPayment] = useState<BookingQrPayment | null>(null);
  const [qrBookingId, setQrBookingId] = useState<string | null>(null);

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
      const payload: BookingRequest = {
        khachSanId: hotelId,
        ngayNhanPhong: startDate.toISOString(),
        ngayTraPhong: endDate.toISOString(),
        phuongThucThanhToan: paymentMethod,
        maKhuyenMai: maKhuyenMai?.trim() || null,
        danhSachPhong: rooms.map((room: any) => ({
          loaiPhongId: room.id,
          soLuong: Number(room.quantity),
        })),
      };

      if (paymentMethod === "qr") {
        let bookingId = qrBookingId;

        if (!bookingId) {
          const bookingResponse = await createBooking(payload);
          bookingId = extractBookingId(bookingResponse);

          if (!bookingId) {
            throw new Error("Đơn đã được tạo nhưng response không có mã đặt phòng.");
          }

          setQrBookingId(bookingId);
        }

        let qrResponse: BookingQrPayment;
        try {
          qrResponse = await getBookingQr(bookingId);
        } catch (error) {
          console.error(error);
          showToast(
            "Đặt phòng đã được tạo nhưng chưa lấy được mã QR. Vui lòng thử lại.",
            "error"
          );
          return;
        }

        setQrPayment(qrResponse);
        showToast("Đã tạo mã QR thanh toán.");
        return;
      }

      await createBooking(payload);

      showToast(
        "Đặt phòng thành công!"
      );

      navigate("/bookings");
    } catch (error: any) {
      showToast(error?.response?.data?.message || error?.message || "Thanh toán thất bại. Vui lòng thử lại.", "error");
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
      | "cash"
      | "qr";
    icon: string;
    title: string;
    description: string;
  }) => {
    const selected =
      paymentMethod === value;

    return (
      <div
        onClick={() => {
          if (!qrPayment) setPaymentMethod(value);
        }}
        style={{
          border: selected
            ? "2px solid #4f46e5"
            : "1px solid #e2e8f0",

          background: selected
            ? "#eef2ff"
            : "#ffffff",

          borderRadius: 14,
          padding: "15px 16px",
          cursor: qrPayment ? "default" : "pointer",
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
                    value="cash"
                    icon="💵"
                    title="Thanh toán tiền mặt tại quầy"
                    description="Thanh toán trực tiếp tại khách sạn"
                  />

                  <PaymentMethodCard
                    value="qr"
                    icon="▣"
                    title="Thanh toán bằng QR"
                    description="Quét mã QR để thanh toán nhanh"
                  />

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

                      {qrPayment ? (
                        <>
                          <p className="text-secondary" style={{ fontSize: 13 }}>
                            Quét mã bằng ứng dụng ngân hàng và giữ nguyên nội dung chuyển khoản.
                          </p>
                          <img
                            src={qrPayment.qrCodeUrl}
                            alt={`Mã QR thanh toán ${qrPayment.amount.toLocaleString("vi-VN")} VND`}
                            style={{
                              width: 230,
                              maxWidth: "100%",
                              height: "auto",
                              background: "#fff",
                              borderRadius: 12,
                              border: "1px solid #e2e8f0",
                              margin: "4px auto 16px",
                            }}
                          />
                          <div className="fw-bold text-danger mb-3" style={{ fontSize: 20 }}>
                            {qrPayment.amount.toLocaleString("vi-VN")} VND
                          </div>
                          <div className="mx-auto text-start" style={{ maxWidth: 360, fontSize: 14 }}>
                            <div className="d-flex justify-content-between gap-3 py-2 border-top">
                              <span className="text-secondary">Ngân hàng</span>
                              <strong>{qrPayment.bankCode}</strong>
                            </div>
                            <div className="d-flex justify-content-between gap-3 py-2 border-top">
                              <span className="text-secondary">Số tài khoản</span>
                              <strong>{qrPayment.accountNumber}</strong>
                            </div>
                            <div className="d-flex justify-content-between gap-3 py-2 border-top">
                              <span className="text-secondary">Chủ tài khoản</span>
                              <strong>{qrPayment.accountName}</strong>
                            </div>
                            <div className="d-flex justify-content-between gap-3 py-2 border-top">
                              <span className="text-secondary">Nội dung</span>
                              <strong>{qrPayment.paymentNote}</strong>
                            </div>
                          </div>
                          <p className="text-secondary mt-3 mb-0" style={{ fontSize: 12 }}>
                            Đặt phòng đã được tạo. Trạng thái thanh toán sẽ được cập nhật sau khi hệ thống xác nhận giao dịch.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-secondary mb-3" style={{ fontSize: 13 }}>
                            Mã QR và thông tin chuyển khoản sẽ hiển thị sau khi bạn tạo yêu cầu thanh toán.
                          </div>
                          <div className="fw-bold text-danger" style={{ fontSize: 20 }}>
                            {total.toLocaleString("vi-VN")} VND
                          </div>
                        </>
                      )}
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
                      disabled={loading || Boolean(qrPayment)}
                      onClick={handlePayment}
                      style={{
                        borderRadius: 12,
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      {loading
                        ? "Đang xử lý..."
                        : qrPayment
                        ? "Đã tạo mã QR thanh toán"
                        : paymentMethod === "cash"
                        ? "Đặt phòng và thanh toán tại quầy"
                        : `Thanh toán ${total.toLocaleString(
                            "vi-VN"
                          )} VND`}
                    </Button>

                    {qrPayment && (
                      <Button
                        variant="outline-primary"
                        className="w-100 mt-2"
                        onClick={() => navigate("/bookings")}
                        style={{ borderRadius: 12, padding: 11 }}
                      >
                        Về lịch sử đặt phòng
                      </Button>
                    )}

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