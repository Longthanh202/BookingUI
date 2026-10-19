import React, { useMemo, useState } from "react";
import { useOwnerCommissions } from "../../hooks/useOwnerQueries";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import OwnerRefreshButton from "../../components/owner/OwnerRefreshButton";
import NumberedPagination from "../../components/common/NumberedPagination";

const OwnerCommissionPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  /**
   * Lấy ownerId
   *
   * Bạn thay đoạn này bằng cách lấy ID user
   * thực tế trong localStorage/token của hệ thống.
   */

  const {
    data: hoaHongs = [],
    isLoading,
    isError,
    refetch,
  } = useOwnerCommissions();

  /**
   * Tổng hoa hồng
   */
  const tongHoaHong = useMemo(() => {
    return hoaHongs.reduce(
      (sum, item) => sum + Number(item.soTienHoaHong || 0),
      0
    );
  }, [hoaHongs]);

  /**
   * Hoa hồng đã thu
   */
  const hoaHongDaThu = useMemo(() => {
    return hoaHongs
      .filter((x) => x.trangThai === "DA_THU")
      .reduce(
        (sum, item) => sum + Number(item.soTienHoaHong || 0),
        0
      );
  }, [hoaHongs]);

  /**
   * Hoa hồng chưa thu
   */
  const hoaHongChuaThu = useMemo(() => {
    return hoaHongs
      .filter((x) => x.trangThai !== "DA_THU")
      .reduce(
        (sum, item) => sum + Number(item.soTienHoaHong || 0),
        0
      );
  }, [hoaHongs]);
  const totalPages = Math.max(1, Math.ceil(hoaHongs.length / pageSize));
  const visibleCommissions = hoaHongs.slice((page - 1) * pageSize, page * pageSize);

  /**
   * Format tiền
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  /**
   * Format ngày
   */
  const formatDate = (value?: string | null) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  /**
   * Badge trạng thái
   */
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "DA_THU":
        return (
          <Badge bg="success" className="px-3 py-2">
            Đã thu
          </Badge>
        );

      case "CHUA_THU":
        return (
          <Badge bg="warning" text="dark" className="px-3 py-2">
            Chưa thu
          </Badge>
        );

      case "CHO_THU":
        return (
          <Badge bg="info" className="px-3 py-2">
            Chờ thu
          </Badge>
        );

      default:
        return (
          <Badge bg="secondary" className="px-3 py-2">
            {status || "Không xác định"}
          </Badge>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Hoa hồng</h3>

          <div className="text-secondary">
            Quản lý doanh thu hoa hồng từ các đơn đặt phòng
          </div>
        </div>

        <OwnerRefreshButton />
      </div>

      {/* Statistics */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="text-secondary mb-2">
                Tổng hoa hồng
              </div>

              <h3 className="fw-bold mb-1">
                {formatCurrency(tongHoaHong)}
              </h3>

              <small className="text-secondary">
                {hoaHongs.length} giao dịch
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="text-secondary mb-2">
                Hoa hồng đã thu
              </div>

              <h3 className="fw-bold text-success mb-1">
                {formatCurrency(hoaHongDaThu)}
              </h3>

              <small className="text-secondary">
                Đã hoàn tất
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="text-secondary mb-2">
                Chưa thu
              </div>

              <h3 className="fw-bold text-warning mb-1">
                {formatCurrency(hoaHongChuaThu)}
              </h3>

              <small className="text-secondary">
                Đang chờ xử lý
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main table */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <div className="p-4 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">
                  Danh sách hoa hồng
                </h5>

                <span className="text-secondary">
                  Theo dõi các khoản hoa hồng từ khách sạn
                </span>
              </div>

              <Badge bg="light" text="dark" className="px-3 py-2">
                {hoaHongs.length} giao dịch
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />

              <div className="text-secondary mt-3">
                Đang tải dữ liệu...
              </div>
            </div>
          ) : isError ? (
            <div className="text-center py-5">
              <div className="text-danger mb-3">
                Không thể tải dữ liệu hoa hồng.
              </div>

              <Button
                variant="outline-primary"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : hoaHongs.length === 0 ? (
            <div className="text-center py-5">
              <div
                style={{
                  fontSize: 48,
                  opacity: 0.4,
                }}
              >
                💰
              </div>

              <h5 className="mt-3">
                Chưa có giao dịch hoa hồng
              </h5>

              <p className="text-secondary mb-0">
                Các khoản hoa hồng sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table
                hover
                className="mb-0 align-middle"
              >
                <thead
                  style={{
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <tr>
                    <th className="px-4 py-3">
                      Mã
                    </th>

                    <th className="py-3">
                      Khách sạn
                    </th>

                    <th className="py-3">
                      Mã đặt phòng
                    </th>

                    <th className="py-3 text-center">
                      Tỷ lệ
                    </th>

                    <th className="py-3 text-end">
                      Tiền hoa hồng
                    </th>

                    <th className="py-3 text-center">
                      Trạng thái
                    </th>

                    <th className="py-3">
                      Ngày tạo
                    </th>

                    <th className="py-3">
                      Ngày thu
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCommissions.map((item) => (
                    <tr key={item.maHoaHong}>
                      <td className="px-4">
                        <span className="fw-semibold">
                          #{item.maHoaHong}
                        </span>
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {item.tenKhachSan}
                        </div>

                        <small className="text-secondary">
                          {item.maKhachSan}
                        </small>
                      </td>

                      <td>
                        <span
                          className="text-secondary"
                          style={{
                            fontSize: 13,
                          }}
                        >
                          {item.maDatPhong}
                        </span>
                      </td>

                      <td className="text-center">
                        <Badge
                          bg="light"
                          text="dark"
                          className="border"
                        >
                          {item.tyLeHoaHong}%
                        </Badge>
                      </td>

                      <td className="text-end">
                        <span className="fw-bold">
                          {formatCurrency(
                            item.soTienHoaHong
                          )}
                        </span>
                      </td>

                      <td className="text-center">
                        {getStatusBadge(item.trangThai)}
                      </td>

                      <td>
                        {formatDate(item.ngayTao)}
                      </td>

                      <td>
                        {formatDate(item.ngayThu)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {!isLoading && !isError && hoaHongs.length > 0 && (
            <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default OwnerCommissionPage;