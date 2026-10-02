import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import CustomerHeader from "../../components/customer/home/CustomerHeader/CustomerHeader";

import { cancelBooking, getAllBookingsHistory, getBooking } from "../../api/booking/booking.api";

import {
  Booking,
  BookingHistoryResponse,
} from "../../types/booking/BookingHistory";

const BookingHistoryPage = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);
  const bookingDetail = useQuery({
    queryKey: ["booking-detail", selectedBooking?.id],
    queryFn: () => getBooking(selectedBooking!.id),
    enabled: Boolean(selectedBooking?.id),
  });
  useEffect(() => {
    if (!bookingDetail.data) return;
    const response: any = bookingDetail.data;
    const detail = response?.booking ?? response?.data?.booking ?? response?.data ?? response;
    if (detail?.id) setSelectedBooking(detail);
  }, [bookingDetail.data]);
  const queryClient = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-history"] });
      setSelectedBooking(null);
    },
  });

  const { data, isLoading, isError } =
    useQuery<BookingHistoryResponse, Error>({
      queryKey: [
        "bookings-history",
        pageIndex,
        pageSize,
      ],
      queryFn: () =>
        getAllBookingsHistory(
          pageIndex,
          pageSize
        ),
    });

  const bookingsList: Booking[] = data?.data ?? [];

  // ==============================
  // FORMAT
  // ==============================

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString("vi-VN")} VND`;
  };

  // ==============================
  // STATUS
  // ==============================

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "DA_XAC_NHAN":
        return {
          text: "Đã xác nhận",
          bg: "success",
          icon: "✓",
        };

      case "CHO_XAC_NHAN":
        return {
          text: "Chờ xác nhận",
          bg: "warning",
          icon: "⏳",
        };

      case "DA_HUY":
        return {
          text: "Đã hủy",
          bg: "danger",
          icon: "×",
        };

      default:
        return {
          text: status,
          bg: "secondary",
          icon: "•",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);

    return (
      <Badge
        bg={config.bg}
        className="px-3 py-2 rounded-pill fw-medium"
      >
        {config.icon} {config.text}
      </Badge>
    );
  };

  // ==============================
  // PAYMENT
  // ==============================

  const getPaymentConfig = (payment: string) => {
    switch (payment) {
      case "TIEN_MAT":
        return {
          text: "Thanh toán tại khách sạn",
          icon: "💵",
        };

      case "MOMO":
        return {
          text: "MoMo / QR",
          icon: "📱",
        };

      case "CARD":
        return {
          text: "Thẻ ngân hàng",
          icon: "💳",
        };

      default:
        return {
          text: payment,
          icon: "💰",
        };
    }
  };

  // ==============================
  // TOTAL
  // ==============================

  const getTotalAmount = (booking: Booking) => {
    return booking.chiTietDatPhongs.reduce(
      (sum, detail) => {
        return sum + (detail.gia || 0);
      },
      0
    );
  };

  // ==============================
  // TOTAL ROOMS
  // ==============================

  const getTotalRooms = (booking: Booking) => {
    return booking.chiTietDatPhongs.reduce(
      (sum, detail) =>
        sum + (detail.phongs?.length || 0),
      0
    );
  };

  // ==============================
  // STATISTICS
  // ==============================

  const totalBookings =
    data?.totalRow ?? bookingsList.length;

  const confirmedBookings = bookingsList.filter(
    (x) => x.trangThai === "DA_XAC_NHAN"
  ).length;

  const pendingBookings = bookingsList.filter(
    (x) => x.trangThai === "CHO_XAC_NHAN"
  ).length;

  // ==============================
  // RENDER
  // ==============================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      {/* HEADER */}
      <CustomerHeader />

      <main
        style={{
          maxWidth: 1250,
          margin: "0 auto",
          padding: "35px 20px 60px",
        }}
      >
        {/* ========================= */}
        {/* PAGE HEADER */}
        {/* ========================= */}

        <div className="mb-4">
          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
          >
            <div>
              <div
                className="text-primary fw-semibold mb-1"
                style={{
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
              >
                BOOKING MANAGEMENT
              </div>

              <h2
                className="fw-bold mb-2"
                style={{
                  color: "#111827",
                }}
              >
                Lịch sử đặt phòng
              </h2>

              <p
                className="mb-0"
                style={{
                  color: "#6b7280",
                }}
              >
                Theo dõi và xem chi tiết các đơn đặt
                phòng của bạn.
              </p>
            </div>

            <div>
              <Button
                variant="outline-primary"
                className="rounded-pill px-4"
                onClick={() =>
                  setPageIndex(1)
                }
              >
                ↻ Làm mới
              </Button>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* STATISTICS */}
        {/* ========================= */}

        <div className="row g-3 mb-4">
          {/* TOTAL */}

          <div className="col-12 col-md-4">
            <Card
              className="border-0 h-100"
              style={{
                borderRadius: 18,
                boxShadow:
                  "0 4px 20px rgba(15,23,42,0.06)",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div
                      className="text-secondary mb-2"
                      style={{ fontSize: 14 }}
                    >
                      Tổng đặt phòng
                    </div>

                    <h3 className="fw-bold mb-0">
                      {totalBookings}
                    </h3>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#eef2ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    🏨
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* CONFIRMED */}

          <div className="col-12 col-md-4">
            <Card
              className="border-0 h-100"
              style={{
                borderRadius: 18,
                boxShadow:
                  "0 4px 20px rgba(15,23,42,0.06)",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div
                      className="text-secondary mb-2"
                      style={{ fontSize: 14 }}
                    >
                      Đã xác nhận
                    </div>

                    <h3 className="fw-bold mb-0 text-success">
                      {confirmedBookings}
                    </h3>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#ecfdf5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    ✓
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* PENDING */}

          <div className="col-12 col-md-4">
            <Card
              className="border-0 h-100"
              style={{
                borderRadius: 18,
                boxShadow:
                  "0 4px 20px rgba(15,23,42,0.06)",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div
                      className="text-secondary mb-2"
                      style={{ fontSize: 14 }}
                    >
                      Chờ xác nhận
                    </div>

                    <h3 className="fw-bold mb-0 text-warning">
                      {pendingBookings}
                    </h3>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#fffbeb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    ⏳
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* ========================= */}
        {/* BOOKING TABLE */}
        {/* ========================= */}

        <Card
          className="border-0"
          style={{
            borderRadius: 20,
            overflow: "hidden",
            boxShadow:
              "0 6px 25px rgba(15,23,42,0.06)",
          }}
        >
          <Card.Body className="p-0">
            {/* TABLE HEADER */}

            <div
              className="d-flex justify-content-between align-items-center flex-wrap gap-2"
              style={{
                padding: "22px 24px",
                borderBottom:
                  "1px solid #eef0f4",
              }}
            >
              <div>
                <h5 className="fw-bold mb-1">
                  Danh sách đặt phòng
                </h5>

                <span
                  className="text-secondary"
                  style={{ fontSize: 14 }}
                >
                  Click vào một booking để xem
                  thông tin chi tiết
                </span>
              </div>

              <Badge
                bg="light"
                text="dark"
                className="border rounded-pill px-3 py-2"
              >
                {bookingsList.length} booking
              </Badge>
            </div>

            {/* LOADING */}

            {isLoading ? (
              <div
                className="text-center py-5"
              >
                <Spinner
                  animation="border"
                  variant="primary"
                />

                <div
                  className="text-secondary mt-3"
                >
                  Đang tải lịch sử đặt phòng...
                </div>
              </div>
            ) : isError ? (
              <div className="text-center text-danger py-5">
                Không thể tải lịch sử booking. Vui lòng thử lại.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table
                    hover
                    className="mb-0 align-middle"
                  >
                    <thead
                      style={{
                        background: "#f8fafc",
                      }}
                    >
                      <tr>
                        <th
                          className="border-0 px-4 py-3"
                        >
                          Khách sạn
                        </th>

                        <th className="border-0">
                          Phòng
                        </th>

                        <th className="border-0">
                          Tổng tiền
                        </th>

                        <th className="border-0">
                          Thanh toán
                        </th>

                        <th className="border-0">
                          Trạng thái
                        </th>

                        <th className="border-0 text-center">
                          Chi tiết
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {bookingsList.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-5"
                          >
                            <div
                              style={{
                                fontSize: 45,
                                marginBottom: 12,
                              }}
                            >
                              🏨
                            </div>

                            <h6 className="fw-bold">
                              Chưa có lịch sử đặt
                              phòng
                            </h6>

                            <div className="text-secondary">
                              Các booking của bạn
                              sẽ được hiển thị tại
                              đây.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bookingsList.map(
                          (booking) => {
                            const totalRooms =
                              getTotalRooms(
                                booking
                              );

                            const totalAmount =
                              getTotalAmount(
                                booking
                              );

                            const payment =
                              getPaymentConfig(
                                booking.thanhToan
                              );

                            return (
                              <tr
                                key={
                                  booking.id
                                }
                                onClick={() =>
                                  setSelectedBooking(
                                    booking
                                  )
                                }
                                style={{
                                  cursor:
                                    "pointer",
                                }}
                              >
                                {/* HOTEL */}

                                <td className="px-4 py-4">
                                  <div className="d-flex align-items-center gap-3">
                                    <div
                                      style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 12,
                                        background:
                                          "#eef2ff",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                        fontSize: 20,
                                      }}
                                    >
                                      🏨
                                    </div>

                                    <div>
                                      <div className="fw-semibold">
                                        {
                                          booking.tenKhachSan
                                        }
                                      </div>

                                      <div
                                        className="text-secondary"
                                        style={{
                                          fontSize: 12,
                                        }}
                                      >
                                        #{booking.id.slice(
                                          0,
                                          8
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* ROOMS */}

                                <td>
                                  <div className="fw-semibold">
                                    {totalRooms}{" "}
                                    phòng
                                  </div>

                                  <div
                                    className="text-secondary"
                                    style={{
                                      fontSize: 13,
                                    }}
                                  >
                                    {
                                      booking
                                        .chiTietDatPhongs
                                        .length
                                    }{" "}
                                    loại phòng
                                  </div>
                                </td>

                                {/* TOTAL */}

                                <td>
                                  <div
                                    className="fw-bold text-danger"
                                  >
                                    {formatCurrency(
                                      totalAmount
                                    )}
                                  </div>
                                </td>

                                {/* PAYMENT */}

                                <td>
                                  <div>
                                    {
                                      payment.icon
                                    }{" "}
                                    {
                                      payment.text
                                    }
                                  </div>
                                </td>

                                {/* STATUS */}

                                <td>
                                  {getStatusBadge(
                                    booking.trangThai
                                  )}
                                </td>

                                {/* DETAIL */}

                                <td className="text-center">
                                  <Button
                                    variant="light"
                                    className="rounded-circle"
                                    style={{
                                      width: 38,
                                      height: 38,
                                    }}
                                    onClick={(
                                      e
                                    ) => {
                                      e.stopPropagation();

                                      setSelectedBooking(
                                        booking
                                      );
                                    }}
                                  >
                                    →
                                  </Button>
                                </td>
                              </tr>
                            );
                          }
                        )
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* ========================= */}
                {/* PAGINATION */}
                {/* ========================= */}

                {data &&
                  data.totalPage > 1 && (
                    <div
                      className="d-flex justify-content-between align-items-center flex-wrap gap-3"
                      style={{
                        padding:
                          "18px 24px",
                        borderTop:
                          "1px solid #eef0f4",
                      }}
                    >
                      <div
                        className="text-secondary"
                        style={{
                          fontSize: 14,
                        }}
                      >
                        Trang{" "}
                        <strong>
                          {pageIndex}
                        </strong>{" "}
                        /{" "}
                        <strong>
                          {data.totalPage}
                        </strong>
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          className="rounded-pill px-4"
                          disabled={
                            pageIndex <= 1
                          }
                          onClick={() =>
                            setPageIndex(
                              (prev) =>
                                prev - 1
                            )
                          }
                        >
                          ← Trước
                        </Button>

                        <Button
                          variant="primary"
                          className="rounded-pill px-4"
                          disabled={
                            pageIndex >=
                            data.totalPage
                          }
                          onClick={() =>
                            setPageIndex(
                              (prev) =>
                                prev + 1
                            )
                          }
                        >
                          Sau →
                        </Button>
                      </div>
                    </div>
                  )}
              </>
            )}
          </Card.Body>
        </Card>
      </main>

      {/* ================================================= */}
      {/* DETAIL MODAL */}
      {/* ================================================= */}

      <Modal
        show={selectedBooking !== null}
        onHide={() =>
          setSelectedBooking(null)
        }
        size="lg"
        centered
      >
        {selectedBooking && (
          <>
            {bookingDetail.isLoading && (
              <Modal.Body className="text-center">
                <Spinner animation="border" /> Đang tải chi tiết booking...
              </Modal.Body>
            )}
            {bookingDetail.isError && (
              <Modal.Body>
                <div className="alert alert-warning mb-0">
                  Không thể tải chi tiết đầy đủ. Đang hiển thị dữ liệu lịch sử booking.
                </div>
              </Modal.Body>
            )}
            {/* MODAL HEADER */}

            <Modal.Header
              closeButton
              style={{
                border: "none",
                padding:
                  "24px 28px 15px",
              }}
            >
              <div>
                <div
                  className="text-primary fw-semibold"
                  style={{
                    fontSize: 13,
                  }}
                >
                  BOOKING DETAILS
                </div>

                <Modal.Title className="fw-bold mt-1">
                  Chi tiết đặt phòng
                </Modal.Title>
              </div>
            </Modal.Header>

            <Modal.Body
              style={{
                padding:
                  "10px 28px 28px",
                background: "#fff",
              }}
            >
              {/* HOTEL INFO */}

              <div
                style={{
                  background:
                    "linear-gradient(135deg, #eef2ff, #f8fafc)",
                  borderRadius: 18,
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="d-flex gap-3">
                    <div
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 15,
                        background:
                          "#ffffff",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize: 24,
                        boxShadow:
                          "0 4px 12px rgba(0,0,0,.06)",
                      }}
                    >
                      🏨
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1">
                        {
                          selectedBooking.tenKhachSan
                        }
                      </h5>

                      <div
                        className="text-secondary"
                        style={{
                          fontSize: 13,
                        }}
                      >
                        Mã đặt phòng
                      </div>

                      <div className="fw-semibold">
                        #{selectedBooking.id}
                      </div>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(
                      selectedBooking.trangThai
                    )}
                  </div>
                </div>
              </div>

              {/* GENERAL INFORMATION */}

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div
                    style={{
                      border:
                        "1px solid #eef0f4",
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <div
                      className="text-secondary mb-1"
                      style={{
                        fontSize: 13,
                      }}
                    >
                      Phương thức thanh toán
                    </div>

                    <div className="fw-semibold">
                      {
                        getPaymentConfig(
                          selectedBooking.thanhToan
                        ).icon
                      }{" "}
                      {
                        getPaymentConfig(
                          selectedBooking.thanhToan
                        ).text
                      }
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div
                    style={{
                      border:
                        "1px solid #eef0f4",
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <div
                      className="text-secondary mb-1"
                      style={{
                        fontSize: 13,
                      }}
                    >
                      Tổng số phòng
                    </div>

                    <div className="fw-semibold">
                      {getTotalRooms(
                        selectedBooking
                      )}{" "}
                      phòng
                    </div>
                  </div>
                </div>
              </div>

              {/* ROOM TITLE */}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  Chi tiết phòng
                </h5>

                <Badge
                  bg="light"
                  text="dark"
                  className="border rounded-pill px-3 py-2"
                >
                  {
                    selectedBooking
                      .chiTietDatPhongs
                      .length
                  }{" "}
                  loại phòng
                </Badge>
              </div>

              {/* ROOMS */}

              {selectedBooking.chiTietDatPhongs.map(
                (detail) => (
                  <div
                    key={detail.id}
                    style={{
                      border:
                        "1px solid #e9edf3",
                      borderRadius: 16,
                      padding: 18,
                      marginBottom: 14,
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h6 className="fw-bold mb-1">
                          {
                            detail.tenLoaiPhong
                          }
                        </h6>

                        <div className="text-secondary">
                          Giá phòng
                        </div>

                        <div className="fw-semibold text-danger">
                          {formatCurrency(
                            detail.gia
                          )}
                        </div>
                      </div>

                      <Badge
                        bg="primary"
                        className="rounded-pill px-3 py-2"
                      >
                        {
                          detail.phongs
                            ?.length
                        }{" "}
                        phòng
                      </Badge>
                    </div>

                    <hr />

                    <div>
                      <div
                        className="text-secondary mb-2"
                        style={{
                          fontSize: 13,
                        }}
                      >
                        Phòng được phân
                      </div>

                      {detail.phongs &&
                      detail.phongs.length >
                        0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {detail.phongs.map(
                            (room) => (
                              <div
                                key={
                                  room.id
                                }
                                style={{
                                  padding:
                                    "7px 12px",
                                  background:
                                    "#f8fafc",
                                  border:
                                    "1px solid #e5e7eb",
                                  borderRadius: 10,
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                🛏 Phòng{" "}
                                {
                                  room.soPhong
                                }
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-secondary">
                          Chưa được phân phòng
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* TOTAL */}

              <div
                style={{
                  background: "#fff7ed",
                  borderRadius: 16,
                  padding: 20,
                  marginTop: 20,
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div
                      className="text-secondary"
                      style={{
                        fontSize: 13,
                      }}
                    >
                      Tổng thanh toán
                    </div>

                    <div className="fw-semibold">
                      Đã bao gồm các phòng đã
                      đặt
                    </div>
                  </div>

                  <div
                    className="text-danger fw-bold"
                    style={{
                      fontSize: 22,
                    }}
                  >
                    {formatCurrency(
                      getTotalAmount(
                        selectedBooking
                      )
                    )}
                  </div>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer
              style={{
                border: "none",
                padding:
                  "15px 28px 24px",
              }}
            >
              <Button
                variant="secondary"
                className="rounded-pill px-4"
                onClick={() =>
                  setSelectedBooking(null)
                }
              >
                Đóng
              </Button>
              {selectedBooking && ["CHO_XAC_NHAN", "DA_XAC_NHAN"].includes(selectedBooking.trangThai) && (
                <Button
                  variant="outline-danger"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(selectedBooking.id)}
                >
                  {cancelMutation.isPending ? "Đang hủy..." : "Hủy booking"}
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default BookingHistoryPage;