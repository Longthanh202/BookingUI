import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Form, Table } from "react-bootstrap";
import { getOwnerBookingCustomers } from "../../api/booking/booking.api";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { responseRows, valueOf } from "../../components/owner/OwnerWorkspaceData";
import { HotelSelector } from "../../components/owner/OwnerSelectors";

export default function CustomerOwnerPage() {
  const [hotelId, setHotelId] = useState("");
  const [search, setSearch] = useState("");
  const hotels = useQuery({
    queryKey: ["owner-hotels"],
    queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }),
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["owner-booking-customers", hotelId],
    queryFn: () => getOwnerBookingCustomers(hotelId),
    enabled: Boolean(hotelId),
  });
  const customers = responseRows(data).filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <OwnerPageShell title="Khách hàng" description="Xem khách đã đặt khách sạn thuộc tài khoản Owner.">
      <Card className="owner-panel">
        <Card.Body>
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-5">
              <Form.Label>Khách sạn</Form.Label>
              <HotelSelector data={hotels.data} value={hotelId} onChange={setHotelId} />
            </div>
            <div className="col-md-7">
              <Form.Label>Tìm khách hàng</Form.Label>
              <Form.Control
                placeholder="Tìm tên, email hoặc số điện thoại"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={!hotelId}
              />
            </div>
          </div>
          {!hotelId ? (
            <p className="text-muted mb-0">Chọn khách sạn để xem khách hàng đã đặt.</p>
          ) : isLoading ? (
            <p className="text-muted mb-0">Đang tải khách hàng...</p>
          ) : isError ? (
            <p className="text-danger mb-0">Không thể tải danh sách khách hàng.</p>
          ) : (
            <Table responsive className="owner-table align-middle">
              <thead>
                <tr><th>Khách hàng</th><th>Email</th><th>Số điện thoại</th></tr>
              </thead>
              <tbody>
                {customers.map((row, index) => (
                  <tr key={String(valueOf(row, "id", "customerId", "khachHangId") || index)}>
                    <td>{valueOf(row, "tenKhachHang", "hoTen", "name", "fullName")}</td>
                    <td>{valueOf(row, "email")}</td>
                    <td>{valueOf(row, "soDienThoai", "phone")}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </OwnerPageShell>
  );
}
