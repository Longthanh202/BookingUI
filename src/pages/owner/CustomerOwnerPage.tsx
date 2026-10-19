import { useEffect, useState } from "react";
import { Card, Form, Table } from "react-bootstrap";
import { useOwnerCustomers, useOwnerHotels } from "../../hooks/useOwnerQueries";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import NumberedPagination from "../../components/common/NumberedPagination";
import { responseRows, valueOf } from "../../components/owner/OwnerWorkspaceData";
import { HotelSelector } from "../../components/owner/OwnerSelectors";

export default function CustomerOwnerPage() {
  const [hotelId, setHotelId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const hotels = useOwnerHotels();
  const { data, isLoading, isError } = useOwnerCustomers(hotelId);
  const customers = responseRows(data).filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <OwnerPageShell title="Khách hàng" description="Xem khách đã đặt khách sạn thuộc tài khoản Owner.">
      <Card className="owner-panel">
        <Card.Body>
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-5">
              <Form.Label>Khách sạn</Form.Label>
              <HotelSelector data={hotels.data} value={hotelId} onChange={(value) => { setHotelId(value); setPage(1); }} />
            </div>
            <div className="col-md-7">
              <Form.Label>Tìm khách hàng</Form.Label>
              <Form.Control
                placeholder="Tìm tên, email hoặc số điện thoại"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
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
                {customers.slice((page - 1) * pageSize, page * pageSize).map((row, index) => (
                  <tr key={String(valueOf(row, "id", "customerId", "khachHangId") || index)}>
                    <td>{valueOf(row, "tenKhachHang", "hoTen", "name", "fullName")}</td>
                    <td>{valueOf(row, "email")}</td>
                    <td>{valueOf(row, "soDienThoai", "phone")}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {hotelId && !isLoading && !isError && (
            <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </Card.Body>
      </Card>
    </OwnerPageShell>
  );
}
