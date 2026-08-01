import { useMemo, useState } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { useHotelRooms } from "../../hooks/useHotelRooms";
import { RoomResponse } from "../../types/loaiphong/RoomResponse";

interface Props {
  hotelId: string;
}



const HotelRooms = ({ hotelId }: Props) => {
  const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const [ngayNhan, setNgayNhan] = useState(formatDate(today));
    const [ngayTra, setNgayTra] = useState(formatDate(tomorrow));
    const [soKhach, setSoKhach] = useState(1);
  const [request, setRequest] = useState({
    hotelId,
    soKhach: 1,
    ngayNhan: "",
    ngayTra: "",
  });

  const [enabled, setEnabled] = useState(false);

  const { data: rooms = [], isLoading } = useHotelRooms(
    request,
    enabled
  );

  const [selectedRooms, setSelectedRooms] = useState<
    Record<string, number>
  >({});

  const handleSearch = () => {
    if (!ngayNhan || !ngayTra) {
      alert("Vui lòng chọn ngày.");
      return;
    }

    setRequest({
      hotelId,
      soKhach,
      ngayNhan,
      ngayTra,
    });

    setEnabled(true);
  };

  const handleSelect = (roomId: string, quantity: number) => {
    setSelectedRooms((prev) => ({
      ...prev,
      [roomId]: quantity,
    }));
  };

  const tongTien = useMemo(() => {
    return rooms.reduce((sum, room) => {
      return (
        sum +
        room.tongTien *
          (selectedRooms[room.id] ?? 0)
      );
    }, 0);
  }, [rooms, selectedRooms]);

  return (
    <>
      <h4 className="mb-4">Kiểm tra phòng</h4>

      <Row className="mb-4">

        <Col md={3}>
          <Form.Group>
            <Form.Label>Ngày nhận</Form.Label>
            <Form.Control
              type="date"
              value={ngayNhan}
              onChange={(e) =>
                setNgayNhan(e.target.value)
              }
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Ngày trả</Form.Label>
            <Form.Control
              type="date"
              value={ngayTra}
              onChange={(e) =>
                setNgayTra(e.target.value)
              }
            />
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group>
            <Form.Label>Số khách</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={soKhach}
              onChange={(e) =>
                setSoKhach(Number(e.target.value))
              }
            />
          </Form.Group>
        </Col>

        <Col
          md={2}
          className="d-flex align-items-end"
        >
          <Button
            variant="primary"
            onClick={handleSearch}
            className="w-100"
          >
            Tìm phòng
          </Button>
        </Col>

      </Row>

      <Table bordered hover responsive>

        <thead>
          <tr>
            <th>Loại phòng</th>
            <th>Sức chứa</th>
            <th>Giường</th>
            <th>Giá / đêm</th>
            <th>Tổng tiền</th>
            <th>Còn trống</th>
            <th>Chọn</th>
          </tr>
        </thead>

        <tbody>

          {rooms.map((room: RoomResponse) => (
            <tr key={room.id}>

              <td>{room.tenLoaiPhong}</td>

              <td>{room.soKhachToiDa}</td>

              <td>{room.kieuGiuong}</td>

              <td>
                {room.giaMoiDem.toLocaleString()} đ
              </td>

              <td>
                {room.tongTien.toLocaleString()} đ
              </td>

              <td>{room.soPhongTrong}</td>

              <td>

                <Form.Select
                  disabled={!room.duChoSoKhach}
                  value={selectedRooms[room.id] ?? 0}
                  onChange={(e) =>
                    handleSelect(
                      room.id,
                      Number(e.target.value)
                    )
                  }
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
          ))}

        </tbody>

      </Table>

      <div className="text-end mt-3">

        <h5>
          Tổng tiền:{" "}
          <span className="text-danger">
            {tongTien.toLocaleString()} đ
          </span>
        </h5>

      </div>
    </>
  );
};

export default HotelRooms;