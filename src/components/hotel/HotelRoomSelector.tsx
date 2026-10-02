import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useHotelRooms } from "../../hooks/useHotelRooms";
import { RoomResponse } from "../../types/loaiphong/RoomResponse";
import { showToast } from "../common/Toast";

interface Props {
  hotelId: string;
  hotelName: string;
  hotelAddress: string;
  hotelImage?: string;
  checkInTime?: string;
  checkOutTime?: string;
  initialCheckIn?: string | null;
  initialCheckOut?: string | null;
  initialGuests?: number;
}

export const HotelRoomSelector = ({
  hotelId,
  hotelName,
  hotelAddress,
  hotelImage,
  checkInTime = "14:00",
  checkOutTime = "12:00",
  initialCheckIn,
  initialCheckOut,
  initialGuests = 1,
}: Props) => {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (date: Date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split("T")[0];
  };

  const bookingDateTime = (date: string, time: string) => {
    const normalizedTime = time.slice(0, 5) || "00:00";
    return new Date(`${date}T${normalizedTime}:00`).toISOString();
  };

    const dateInputValue = (value?: string | null) => value ? value.slice(0, 10) : "";
    const [ngayNhan, setNgayNhan] = useState(dateInputValue(initialCheckIn) || formatDate(today));
    const [ngayTra, setNgayTra] = useState(dateInputValue(initialCheckOut) || formatDate(tomorrow));
    const [soKhach, setSoKhach] = useState(initialGuests);
    
    const request = useMemo(
    () => ({
      hotelId,
      soKhach,
      ngayNhan,
      ngayTra,
    }),
    [
      hotelId,
      soKhach,
      ngayNhan,
      ngayTra,
    ]
  );

  const { data, isLoading, isError, error } = useHotelRooms(request);
  const rooms = useMemo(
    () => Array.isArray(data) ? data : (data as any)?.data ?? (data as any)?.items ?? [],
    [data]
  );


  const [selectedRooms, setSelectedRooms] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    setSelectedRooms({});
  }, [hotelId, ngayNhan, ngayTra, soKhach]);

  useEffect(() => {
    if (initialCheckIn) setNgayNhan(initialCheckIn.slice(0, 10));
    if (initialCheckOut) setNgayTra(initialCheckOut.slice(0, 10));
    if (initialGuests && initialGuests > 0) setSoKhach(initialGuests);
  }, [initialCheckIn, initialCheckOut, initialGuests]);

  const dateRangeValid = Boolean(ngayNhan && ngayTra && ngayTra > ngayNhan);

  const handleSelect = (roomId: string, quantity: number) => {
    setSelectedRooms((prev) => ({
      ...prev,
      [roomId]: quantity,
    }));
  };

  const tongTien = useMemo(() => {
    return rooms.reduce((sum: number, room: RoomResponse) => {
      return (
        sum +
        room.tongTien *
          (selectedRooms[room.id] ?? 0)
      );
    }, 0);
  }, [rooms, selectedRooms]);

  const selectedRoomList = rooms.filter(
    (room: RoomResponse) => (selectedRooms[room.id] ?? 0) > 0
  );

const canBook = Boolean(
  selectedRoomList.length > 0 &&
  dateRangeValid &&
  soKhach > 0
);

  const handleBook = () => {
  if (!canBook) {
    showToast("Vui lòng chọn phòng và ngày để đặt phòng.", "info");
    return;
  }

  const bookRooms = selectedRoomList.map((room: RoomResponse) => ({
    id: room.id,
    name: `${hotelName} - ${room.tenLoaiPhong}`,
    quantity: selectedRooms[room.id] ?? 0,
    price: room.tongTien,
    address: hotelAddress,
    image:
      hotelImage ||
      "https://placehold.co/640x360?text=Photo",
  }));

  navigate("/booking/summary", {
    state: {
      hotelId,
      rooms: bookRooms,
      dates: [bookingDateTime(ngayNhan, checkInTime), bookingDateTime(ngayTra, checkOutTime)],
      guests: soKhach,
    },
  });
};

  return (
    <div className="stayro-room-selector">
  <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    <Card.Body className="p-4">

      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            Chọn phòng
          </h4>
          <div className="text-secondary">
            Kiểm tra tình trạng phòng và chọn phòng phù hợp
          </div>
        </div>

        <div
          className="d-none d-md-flex align-items-center justify-content-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "#eef2ff",
            color: "#4f46e5",
            fontSize: 22,
          }}
        >
          🏨
        </div>
      </div>

      {/* ================= SEARCH FILTER ================= */}
      <Card
        className="border rounded-4 mb-4"
        style={{
          background: "#f8fafc",
        }}
      >
        <Card.Body className="p-4">

          <div className="fw-semibold mb-3">
            Thông tin lưu trú
          </div>

          <Row className="g-3">

            {/* Ngày nhận */}
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Ngày nhận phòng
                </Form.Label>

                <Form.Control
                  type="date"
                  value={ngayNhan}
                  min={formatDate(today)}
                  onChange={(e) =>
                    setNgayNhan(e.target.value)
                  }
                  className="rounded-3 py-2"
                />
              </Form.Group>
            </Col>

            {/* Ngày trả */}
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Ngày trả phòng
                </Form.Label>

                <Form.Control
                  type="date"
                  value={ngayTra}
                  min={ngayNhan || formatDate(tomorrow)}
                  onChange={(e) =>
                    setNgayTra(e.target.value)
                  }
                  className="rounded-3 py-2"
                />
              </Form.Group>
            </Col>

            {/* Số khách */}
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Số khách
                </Form.Label>

                <Form.Control
                  type="number"
                  min={1}
                  value={soKhach}
                  onChange={(e) =>
                    setSoKhach(Number(e.target.value))
                  }
                  className="rounded-3 py-2"
                />
              </Form.Group>
            </Col>

          </Row>
        </Card.Body>
      </Card>


      {/* ================= SELECTED ROOM SUMMARY ================= */}
      <Card
        className="border-0 rounded-4 mb-4"
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
        }}
      >
        <Card.Body className="p-4">

          <Row className="align-items-center">

            {/* Selected rooms */}
            <Col xs={12} md={7}>

              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </div>

                <div>
                  <div className="fw-bold">
                    Phòng đã chọn
                  </div>

                  <div className="text-secondary small">
                    {selectedRoomList.length > 0
                      ? `${selectedRoomList.length} loại phòng`
                      : "Chưa chọn phòng"}
                  </div>
                </div>
              </div>

              {selectedRoomList.length > 0 ? (
                <div className="d-flex flex-column gap-2">

                  {selectedRoomList.map((room: RoomResponse) => (
                    <div
                      key={room.id}
                      className="d-flex justify-content-between align-items-center bg-white rounded-3 px-3 py-2"
                    >
                      <div>
                        <span className="fw-semibold">
                          {room.tenLoaiPhong}
                        </span>
                      </div>

                      <span className="badge text-bg-success">
                        {selectedRooms[room.id]} phòng
                      </span>
                    </div>
                  ))}

                </div>
              ) : isError ? (
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="text-center py-5">
                    <div className="fw-semibold">Không thể tìm phòng trong khoảng thời gian này</div>
                    <div className="text-secondary small mt-1">
                      {(error as any)?.response?.data?.message || "Hãy kiểm tra ngày lưu trú và thử lại."}
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <div className="text-secondary">
                  Vui lòng chọn ít nhất một phòng bên dưới.
                </div>
              )}

            </Col>


            {/* Total */}
            <Col
              xs={12}
              md={5}
              className="mt-4 mt-md-0"
            >
              <div
                className="bg-white rounded-4 p-4"
                style={{
                  border: "1px solid #dcfce7",
                }}
              >

                <div className="text-secondary small mb-1">
                  Tổng tiền
                </div>

                <div
                  className="fw-bold text-danger"
                  style={{
                    fontSize: 28,
                  }}
                >
                  {tongTien.toLocaleString()} đ
                </div>

                <div className="text-secondary small mt-1">
                  Cho toàn bộ phòng đã chọn
                </div>

                <Button
                  variant="success"
                  className="w-100 mt-3 rounded-3 fw-semibold py-2"
                  onClick={handleBook}
                  disabled={!canBook}
                >
                  {canBook
                    ? "Đặt phòng ngay"
                    : "Chọn phòng để đặt"}
                </Button>

              </div>
            </Col>

          </Row>

        </Card.Body>
      </Card>


      {/* ================= ROOM LIST ================= */}

      <div className="mb-3">
        <h5 className="fw-bold mb-1">
          Danh sách phòng
        </h5>

        <div className="text-secondary small">
          Các loại phòng đang có sẵn tại khách sạn
        </div>
      </div>

      {!dateRangeValid && (
        <div className="alert alert-warning" role="alert">
          Ngày trả phòng phải sau ngày nhận phòng.
        </div>
      )}

      {/* Loading */}
      {isLoading ? (

        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="py-5 text-center">

            <div
              className="spinner-border text-primary mb-3"
              role="status"
            />

            <div className="fw-semibold">
              Đang tìm phòng...
            </div>

            <div className="text-secondary small mt-1">
              Vui lòng chờ trong giây lát
            </div>

          </Card.Body>
        </Card>

      ) : (

        <div className="table-responsive">

          <Table
            hover
            className="align-middle mb-0"
            style={{
              borderCollapse: "separate",
              borderSpacing: "0 8px",
            }}
          >

            <thead>
              <tr className="text-secondary small">

                <th className="border-0 px-3">
                  LOẠI PHÒNG
                </th>

                <th className="border-0">
                  SỨC CHỨA
                </th>

                <th className="border-0">
                  GIƯỜNG
                </th>

                <th className="border-0">
                  GIÁ / ĐÊM
                </th>

                <th className="border-0">
                  TỔNG TIỀN
                </th>

                <th className="border-0">
                  CÒN TRỐNG
                </th>

                <th className="border-0 text-center">
                  SỐ LƯỢNG
                </th>

              </tr>
            </thead>


            <tbody>

              {rooms.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="text-center border-0 py-5"
                  >

                    <div
                      style={{
                        fontSize: 40,
                        marginBottom: 10,
                      }}
                    >
                      🛏️
                    </div>

                    <div className="fw-semibold">
                      {dateRangeValid ? "Không tìm thấy phòng" : "Chọn ngày lưu trú hợp lệ"}
                    </div>

                    <div className="text-secondary small">
                      Vui lòng thay đổi ngày hoặc số lượng khách.
                    </div>

                  </td>
                </tr>

              ) : (

                rooms.map((room: RoomResponse) => {

                  const selected =
                    (selectedRooms[room.id] ?? 0) > 0;

                  return (

                    <tr
                      key={room.id}
                      style={{
                        background: selected
                          ? "#f0fdf4"
                          : "#ffffff",
                        boxShadow:
                          "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >

                      {/* Room name */}
                      <td className="border-0 px-3 py-3">

                        <div className="fw-semibold">
                          {room.tenLoaiPhong}
                        </div>

                        {selected && (
                          <span
                            className="badge text-bg-success mt-1"
                          >
                            Đã chọn
                          </span>
                        )}

                      </td>


                      {/* Capacity */}
                      <td className="border-0">

                        <span className="text-secondary">
                          👤 {room.soKhachToiDa} khách
                        </span>

                      </td>


                      {/* Bed */}
                      <td className="border-0">

                        <span className="text-secondary">
                          🛏 {room.kieuGiuong}
                        </span>

                      </td>


                      {/* Price */}
                      <td className="border-0">

                        <div className="fw-semibold">
                          {room.giaMoiDem.toLocaleString()} đ
                        </div>

                        <small className="text-secondary">
                          / đêm
                        </small>

                      </td>


                      {/* Total */}
                      <td className="border-0">

                        <div className="fw-semibold text-danger">
                          {room.tongTien.toLocaleString()} đ
                        </div>

                      </td>


                      {/* Available */}
                      <td className="border-0">

                        <span
                          className={
                            room.soPhongTrong > 0
                              ? "badge text-bg-success"
                              : "badge text-bg-danger"
                          }
                        >
                          {room.soPhongTrong > 0
                            ? `${room.soPhongTrong} phòng`
                            : "Hết phòng"}
                        </span>

                      </td>


                      {/* Select */}
                      <td className="border-0 text-center">

                        <Form.Select
                          disabled={
                            !room.duChoSoKhach ||
                            room.soPhongTrong <= 0
                          }
                          value={
                            selectedRooms[room.id] ?? 0
                          }
                          onChange={(e) =>
                            handleSelect(
                              room.id,
                              Number(e.target.value)
                            )
                          }
                          className="rounded-3"
                          style={{
                            width: 90,
                            margin: "0 auto",
                          }}
                        >

                          {Array.from(
                            {
                              length:
                                room.soPhongTrong + 1,
                            },
                            (_, i) => (

                              <option
                                key={i}
                                value={i}
                              >
                                {i}
                              </option>

                            )
                          )}

                        </Form.Select>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </Table>

        </div>

      )}

    </Card.Body>
  </Card>
    </div>
  );
};
