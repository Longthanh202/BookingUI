import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, Form, Table } from "react-bootstrap";
import {
  cancelOwnerBooking,
  checkInBooking,
  checkOutBooking,
  confirmBooking,
  getBookingStatusOptions,
  getOwnerAllBookings,
  getOwnerBookingCustomers,
  rejectOwnerBooking,
} from "../../api/booking/booking.api";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { responseRows, valueOf } from "../../components/owner/OwnerWorkspaceData";
import { HotelSelector } from "../../components/owner/OwnerSelectors";

const pendingStatuses = ["CHO_XAC_NHAN", "Chờ xác nhận"];
const confirmedStatuses = ["DA_XAC_NHAN", "Đã xác nhận"];
const checkedInStatuses = ["DA_CHECK_IN", "Đã nhận phòng", "CHECKED_IN"];
const statusLabels: Record<string, string> = {
  CHO_XAC_NHAN: "Chờ xác nhận",
  DA_XAC_NHAN: "Đã xác nhận",
  DA_CHECK_IN: "Đã nhận phòng",
  CHECKED_IN: "Đã nhận phòng",
  DA_CHECK_OUT: "Đã trả phòng",
  HOAN_TAT: "Hoàn tất",
  DA_HUY: "Đã hủy",
};
const paymentLabels: Record<string, string> = {
  TIEN_MAT: "Tiền mặt",
};

const formatBookingDate = (value: unknown) => {
  if (typeof value !== "string" || !value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const getBookingAmount = (row: any) =>
  (Array.isArray(row?.chiTietDatPhongs) ? row.chiTietDatPhongs : [])
    .reduce((total: number, detail: any) => total + (Number(detail?.gia) || 0), 0);

const getBookingRooms = (row: any) =>
  (Array.isArray(row?.chiTietDatPhongs) ? row.chiTietDatPhongs : [])
    .map((detail: any) => {
      const roomNumbers = Array.isArray(detail?.phongs)
        ? detail.phongs.map((room: any) => room?.soPhong).filter(Boolean)
        : [];
      const roomType = detail?.tenLoaiPhong || "Loại phòng";
      return roomNumbers.length ? `${roomType} (${roomNumbers.join(", ")})` : roomType;
    })
    .join(", ") || "-";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const responseData = response?.data;
    if (typeof responseData === "string") return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string"
    ) {
      return responseData.message;
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
};

export default function BookingOwnerPage() {
  const [search, setSearch] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const client = useQueryClient();
  const hotels = useQuery({
    queryKey: ["owner-hotels"],
    queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }),
  });
  const ownerHotelIds = responseRows(hotels.data)
    .map((hotel) => String(valueOf(hotel, "id", "khachSanId")))
    .filter((id) => id !== "-");
  const customers = useQuery({
    queryKey: ["owner-booking-customers", ownerHotelIds.join(",")],
    queryFn: async () => {
      const customerLists = await Promise.all(
        ownerHotelIds.map((id) => getOwnerBookingCustomers(id))
      );
      const uniqueCustomers = new Map<string, any>();
      customerLists.flatMap(responseRows).forEach((customer) => {
        const id = String(valueOf(customer, "id", "customerId", "khachHangId"));
        if (id !== "-") uniqueCustomers.set(id, customer);
      });
      return Array.from(uniqueCustomers.values());
    },
    enabled: !hotels.isLoading && !hotels.isError,
  });
  const statuses = useQuery({ queryKey: ["booking-status-options"], queryFn: getBookingStatusOptions });
  const bookingQuery = useQuery({
    queryKey: ["owner-all-bookings", hotelId, customerId, status, createdDate, search, page],
    queryFn: () => getOwnerAllBookings({
      hotelId: hotelId || null,
      customerId: customerId || null,
      trangThai: status,
      ngayTao: createdDate ? new Date(`${createdDate}T00:00:00.000Z`).toISOString() : null,
      maDatPhong: search.trim() || null,
      page,
      pageSize: 10,
    }),
    enabled: true,
    refetchOnMount: "always",
  });
  const bookings = responseRows(bookingQuery.data);
  const totalRows = Number(bookingQuery.data?.totalRow ?? bookings.length);
  const totalPages = Number(bookingQuery.data?.totalPage ?? 1);
  const transition = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => {
      if (action === "confirm") return confirmBooking(id);
      if (action === "reject") return rejectOwnerBooking(id);
      if (action === "cancel") return cancelOwnerBooking(id);
      if (action === "check-in") return checkInBooking(id);
      return checkOutBooking(id);
    },
    onSuccess: () => {
      setNotice("Đã cập nhật trạng thái booking.");
      client.invalidateQueries({ queryKey: ["owner-all-bookings"] });
    },
    onError: (error: any) => setNotice(error?.response?.data?.message || "Không thể cập nhật booking."),
  });
  const action = (id: string, operation: string, label: string, variant = "outline-primary") => (
    <Button
      size="sm"
      variant={variant}
      disabled={transition.isPending}
      onClick={() => {
        if ((operation === "cancel" || operation === "reject") && !window.confirm(`Xác nhận ${label.toLowerCase()} booking này?`)) return;
        transition.mutate({ id, action: operation });
      }}
    >{label}</Button>
  );

  return (
    <OwnerPageShell title="Quản lý booking" description="Lọc, xác nhận, từ chối, check-in, checkout hoặc hủy booking thuộc Owner." notice={notice} onDismissNotice={() => setNotice("")} centerTitle>
      <Card className="owner-panel">
        <Card.Body className="p-0">
          <div className="p-3 border-bottom">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-lg-3">
                <Form.Label>Mã đặt phòng</Form.Label>
                <Form.Control
                  placeholder="Tìm theo một phần mã"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                />
              </div>
              <div className="col-lg-3 col-md-6">
                <Form.Label>Khách sạn</Form.Label>
                <HotelSelector data={hotels.data} value={hotelId} onChange={(value) => { setHotelId(value); setPage(1); }} />
              </div>
              <div className="col-lg-3 col-md-6">
                <Form.Label>Khách hàng</Form.Label>
                <Form.Select value={customerId} onChange={(event) => { setCustomerId(event.target.value); setPage(1); }}>
                  <option value="">Tất cả khách hàng</option>
                  {responseRows(customers.data).map((customer) => (
                    <option key={String(valueOf(customer, "id", "customerId", "khachHangId"))} value={String(valueOf(customer, "id", "customerId", "khachHangId"))}>
                      {valueOf(customer, "tenKhachHang", "name", "fullName", "email")}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-lg-3 col-md-6">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                  <option value="">Tất cả trạng thái</option>
                  {responseRows(statuses.data).map((item) => (
                    <option key={String(valueOf(item, "id"))} value={String(valueOf(item, "id"))}>{valueOf(item, "name")}</option>
                  ))}
                </Form.Select>
                {statuses.isError && <small className="text-danger">Không thể tải lựa chọn trạng thái booking.</small>}
              </div>
              <div className="col-lg-3 col-md-6">
                <Form.Label>Ngày tạo</Form.Label>
                <Form.Control type="date" value={createdDate} onChange={(event) => { setCreatedDate(event.target.value); setPage(1); }} />
              </div>
            </div>
            <div className="mt-3"><strong>Danh sách booking</strong><span className="text-muted ms-2">{totalRows} booking</span></div>
          </div>
          {hotels.isError && (
            <div className="px-3 pt-3 text-danger">Không thể tải danh sách khách sạn để lọc.</div>
          )}
          {bookingQuery.isLoading ? (
            <div className="p-4">Đang tải booking...</div>
          ) : bookingQuery.isError ? (
            <div className="p-4 text-danger">
              <div>{getErrorMessage(bookingQuery.error, "Không thể tải booking.")}</div>
              <Button
                className="mt-2"
                variant="outline-danger"
                onClick={() => bookingQuery.refetch()}
              >
                Thử tải lại
              </Button>
            </div>
          ) : (
            <Table responsive className="owner-table align-middle mb-0">
              <thead><tr><th>Booking</th><th>Khách hàng</th><th>Phòng</th><th>Ngày lưu trú</th><th>Giá trị</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {bookings.map((row, index) => {
                  const id = String(valueOf(row, "id", "bookingId", "maBooking"));
                  const codeValue = valueOf(row, "maDatPhong");
                  const bookingCode = codeValue === "-" ? id : String(codeValue);
                  const statusValue = String(valueOf(row, "trangThai", "status"));
                  const actions = pendingStatuses.includes(statusValue)
                    ? <>{action(id, "confirm", "Xác nhận")}{action(id, "reject", "Từ chối", "outline-danger")}</>
                    : confirmedStatuses.includes(statusValue)
                      ? <>{action(id, "check-in", "Check-in")}{action(id, "cancel", "Hủy booking", "outline-danger")}</>
                      : checkedInStatuses.includes(statusValue) ? action(id, "check-out", "Checkout") : null;
                  return (
                    <tr key={id === "-" ? index : id}>
                      <td><strong>{bookingCode}</strong><small className="d-block text-muted">{valueOf(row, "tenKhachSan")}</small></td>
                      <td>{valueOf(row, "tenKhachHang", "guest", "hoTen") === "-" ? "Chưa có thông tin" : valueOf(row, "tenKhachHang", "guest", "hoTen")}</td>
                      <td>{getBookingRooms(row)}</td>
                      <td>{formatBookingDate(row.ngayNhan)} - {formatBookingDate(row.ngayTra)}</td>
                      <td>
                        {getBookingAmount(row).toLocaleString("vi-VN")} đ
                        {Number(row.soTienGiam) > 0 && <small className="d-block text-muted">Giảm {Number(row.soTienGiam).toLocaleString("vi-VN")} đ</small>}
                      </td>
                      <td>{paymentLabels[row.thanhToan] || valueOf(row, "thanhToan")}</td>
                      <td><Badge bg="secondary">{statusLabels[statusValue] || statusValue}</Badge></td>
                      <td><div className="d-flex gap-2">{actions}</div></td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-muted py-4">Không có booking phù hợp.</td></tr>
                )}
              </tbody>
            </Table>
          )}
          {!bookingQuery.isLoading && !bookingQuery.isError && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <span className="text-muted">Trang {page}/{totalPages}</span>
              <div className="d-flex gap-2">
                <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Trước</Button>
                <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Sau</Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </OwnerPageShell>
  );
}
