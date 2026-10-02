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

export default function BookingOwnerPage() {
  const [search, setSearch] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [notice, setNotice] = useState("");
  const client = useQueryClient();
  const hotels = useQuery({
    queryKey: ["owner-hotels"],
    queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }),
  });
  const customers = useQuery({
    queryKey: ["owner-booking-customers", hotelId],
    queryFn: () => getOwnerBookingCustomers(hotelId),
    enabled: Boolean(hotelId),
  });
  const statuses = useQuery({ queryKey: ["booking-status-options"], queryFn: getBookingStatusOptions });
  const bookingQuery = useQuery({
    queryKey: ["owner-all-bookings", hotelId, customerId, status, createdDate],
    queryFn: () => getOwnerAllBookings({
      hotelId: hotelId || null,
      customerId: customerId || null,
      trangThai: status || null,
      ngayTao: createdDate ? new Date(createdDate).toISOString() : null,
      page: 1,
      pageSize: 200,
    }),
  });
  const bookings = responseRows(bookingQuery.data);
  const filtered = bookings.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
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
    <OwnerPageShell title="Quản lý booking" description="Lọc, xác nhận, từ chối, check-in, checkout hoặc hủy booking thuộc Owner." notice={notice} onDismissNotice={() => setNotice("")}>
      <Card className="owner-panel">
        <Card.Body className="p-0">
          <div className="p-3 border-bottom">
            <div className="row g-2 align-items-end">
              <div className="col-lg-3">
                <Form.Label>Khách sạn</Form.Label>
                <HotelSelector data={hotels.data} value={hotelId} onChange={(value) => { setHotelId(value); setCustomerId(""); }} />
              </div>
              <div className="col-lg-2">
                <Form.Label>Khách hàng</Form.Label>
                <Form.Select value={customerId} onChange={(event) => setCustomerId(event.target.value)} disabled={!hotelId}>
                  <option value="">Tất cả khách hàng</option>
                  {responseRows(customers.data).map((customer) => (
                    <option key={String(valueOf(customer, "id", "customerId", "khachHangId"))} value={String(valueOf(customer, "id", "customerId", "khachHangId"))}>
                      {valueOf(customer, "tenKhachHang", "name", "fullName", "email")}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-lg-2">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">Tất cả trạng thái</option>
                  {responseRows(statuses.data).map((item) => (
                    <option key={String(valueOf(item, "id"))} value={String(valueOf(item, "id"))}>{valueOf(item, "name")}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-lg-2">
                <Form.Label>Ngày tạo</Form.Label>
                <Form.Control type="date" value={createdDate} onChange={(event) => setCreatedDate(event.target.value)} />
              </div>
              <div className="col-lg-3">
                <Form.Label>Tìm kiếm</Form.Label>
                <Form.Control placeholder="Mã booking hoặc khách" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
            </div>
            <div className="mt-3"><strong>Danh sách booking</strong><span className="text-muted ms-2">{bookings.length} booking</span></div>
          </div>
          {bookingQuery.isLoading ? (
            <div className="p-4">Đang tải booking...</div>
          ) : bookingQuery.isError ? (
            <div className="p-4 text-danger">Không thể tải booking.</div>
          ) : (
            <Table responsive className="owner-table align-middle mb-0">
              <thead><tr><th>Booking</th><th>Khách hàng</th><th>Phòng</th><th>Ngày lưu trú</th><th>Giá trị</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {filtered.map((row, index) => {
                  const id = String(valueOf(row, "id", "bookingId", "maBooking"));
                  const statusValue = String(valueOf(row, "trangThai", "status"));
                  const actions = pendingStatuses.includes(statusValue)
                    ? <>{action(id, "confirm", "Xác nhận")}{action(id, "reject", "Từ chối", "outline-danger")}</>
                    : confirmedStatuses.includes(statusValue)
                      ? <>{action(id, "check-in", "Check-in")}{action(id, "cancel", "Hủy booking", "outline-danger")}</>
                      : checkedInStatuses.includes(statusValue) ? action(id, "check-out", "Checkout") : null;
                  return (
                    <tr key={id === "-" ? index : id}>
                      <td><strong>{id}</strong></td>
                      <td>{valueOf(row, "tenKhachHang", "guest", "hoTen")}</td>
                      <td>{valueOf(row, "tenLoaiPhong", "room")}</td>
                      <td>{valueOf(row, "ngayNhanPhong", "checkIn")} - {valueOf(row, "ngayTraPhong", "checkOut")}</td>
                      <td>{Number(valueOf(row, "tongTien", "amount") === "-" ? 0 : valueOf(row, "tongTien", "amount")).toLocaleString("vi-VN")} đ</td>
                      <td><Badge bg="secondary">{statusValue}</Badge></td>
                      <td><div className="d-flex gap-2">{actions}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </OwnerPageShell>
  );
}
