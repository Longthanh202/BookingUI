import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetDanhSachKhachSan,
  ThemKhachSan,
  CapNhatKhachSan,
  XoaKhachSan,
} from "../../api/khachsan/khachsan.api";
import { KhachSanListParams } from "../../types/khachsan/KhachSan.types";
import { KhachSan as KhachSanType } from "../../types/khachsan/KhachSan";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import BaseModal from "../../components/modals/BaseModal";
import BaseButton from "../../components/buttons/BaseButton";

const initialFormValues = {
  TenKhachSan: "",
  DiaChi: "",
  ThanhPho: "",
  SoSao: "",
  GioNhanPhong: "",
  GioTraPhong: "",
  MoTa: "",
};

interface HotelRoomType {
  id?: string;
  tenLoaiPhong: string;
  soKhachToiDa: number;
  kieuGiuong: string;
  moTa: string;
}

interface HotelAmenity {
  id?: string | number;
  tenTienIch: string;
}

const KhachSan = () => {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<KhachSanType | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [roomTypes, setRoomTypes] = useState<HotelRoomType[]>([]);
  const [amenities, setAmenities] = useState<HotelAmenity[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const dto: KhachSanListParams = {
    Keyword: "",
    ThanhPho: "",
    ViDo: 0,
    KinhDo: 0,
    SoSao: 0,
    TrangThai: "",
    Page: page,
  };

  const createMutation = useMutation<any, unknown, FormData, unknown>({
    mutationFn: ThemKhachSan,
    onSuccess: () => {
      window.alert("Thêm khách sạn thành công");
      queryClient.invalidateQueries({ queryKey: ["khachsans"] });
      handleClose();
    },
    onError: () => {
      window.alert("Thêm khách sạn thất bại");
    },
  });

  const updateMutation = useMutation<any, unknown, FormData, unknown>({
    mutationFn: CapNhatKhachSan,
    onSuccess: () => {
      window.alert("Cập nhật khách sạn thành công");
      queryClient.invalidateQueries({ queryKey: ["khachsans"] });
      handleClose();
    },
    onError: () => {
      window.alert("Cập nhật khách sạn thất bại");
    },
  });

  const deleteMutation = useMutation<any, unknown, string, unknown>({
    mutationFn: XoaKhachSan,
    onSuccess: () => {
      window.alert("Xóa khách sạn thành công");
      queryClient.invalidateQueries({ queryKey: ["khachsans"] });
    },
    onError: () => {
      window.alert("Xóa khách sạn thất bại");
    },
  });

  const isProcessing =
    createMutation.status === "pending" ||
    updateMutation.status === "pending" ||
    deleteMutation.status === "pending";

  const handleOpen = () => {
    setEditingHotel(null);
    setFormValues(initialFormValues);
    setRoomTypes([]);
    setAmenities([]);
    setNewAmenity("");
    setFormErrors({});
    setUploadedImages([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingHotel(null);
    setFormValues(initialFormValues);
    setFormErrors({});
    setUploadedImages([]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = uploadedImages.length + newFiles.length;

    if (totalImages > 4) {
      window.alert("Tối đa 4 ảnh cho một khách sạn");
      return;
    }

    setUploadedImages((current) => [...current, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formValues.TenKhachSan) errors.TenKhachSan = "Nhập tên khách sạn";
    if (!formValues.DiaChi) errors.DiaChi = "Nhập địa chỉ";
    if (!formValues.ThanhPho) errors.ThanhPho = "Chọn thành phố";
    if (!formValues.SoSao) errors.SoSao = "Chọn số sao";
    if (!formValues.GioNhanPhong) errors.GioNhanPhong = "Chọn giờ nhận phòng";
    if (!formValues.GioTraPhong) errors.GioTraPhong = "Chọn giờ trả phòng";
    if (!formValues.MoTa) errors.MoTa = "Nhập mô tả";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      window.alert("Vui lòng điền đầy đủ thông tin form.");
      return;
    }

    const formData = new FormData();
    formData.append("TenKhachSan", formValues.TenKhachSan);
    formData.append("DiaChi", formValues.DiaChi);
    formData.append("ThanhPho", formValues.ThanhPho);
    formData.append("SoSao", formValues.SoSao);
    formData.append("GioNhanPhong", formValues.GioNhanPhong);
    formData.append("GioTraPhong", formValues.GioTraPhong);
    formData.append("MoTa", formValues.MoTa);
    formData.append("ViDo", "1");
    formData.append("KinhDo", "1");
    formData.append("TrangThai", "cho_duyet");
    formData.append("LoaiPhongs", JSON.stringify(roomTypes));
    formData.append("TienIchs", JSON.stringify(amenities));

    uploadedImages.forEach((image) => {
      formData.append("Files", image);
    });

    if (editingHotel) {
      formData.append("id", editingHotel.id);
      updateMutation.mutate(formData as any);
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const handleEdit = (data: KhachSanType) => {
    setEditingHotel(data);
    setFormValues({
      TenKhachSan: data.tenKhachSan ?? "",
      DiaChi: data.diaChi ?? "",
      ThanhPho: data.thanhPho ?? "",
      SoSao: String(data.soSao ?? ""),
      GioNhanPhong: data.gioNhanPhong ?? "",
      GioTraPhong: data.gioTraPhong ?? "",
      MoTa: data.moTa ?? "",
    });
    setRoomTypes([]);
    setAmenities([]);
    setNewAmenity("");
    setFormErrors({});
    setUploadedImages([]);
    setOpen(true);
  };

  const handleDelete = (item: KhachSanType) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa khách sạn ${item.tenKhachSan}?`);
    if (confirmed) {
      deleteMutation.mutate(item.id);
    }
  };

  const { isLoading, data } = useQuery({
    queryKey: ["khachsans", page],
    queryFn: () => GetDanhSachKhachSan(dto),
  });

  const hotels = data?.data || [];

  return (
    <div>
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "end" }}>
        <BaseButton title="Thêm mới" onOk={handleOpen} />
      </div>

      <BaseModal
        open={open}
        title={editingHotel ? "Sửa khách sạn" : "Thêm khách sạn"}
        onOk={handleSubmit}
        onCancel={handleClose}
        confirmLoading={isProcessing}
      >
        <Form>
          <Form.Group className="mb-3" controlId="hotelName">
            <Form.Label>Tên khách sạn</Form.Label>
            <Form.Control
              type="text"
              value={formValues.TenKhachSan}
              onChange={(e) => setFormValues({ ...formValues, TenKhachSan: e.target.value })}
              isInvalid={Boolean(formErrors.TenKhachSan)}
              disabled={isProcessing}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.TenKhachSan}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="hotelAddress">
            <Form.Label>Địa chỉ khách sạn</Form.Label>
            <Form.Control
              type="text"
              value={formValues.DiaChi}
              onChange={(e) => setFormValues({ ...formValues, DiaChi: e.target.value })}
              isInvalid={Boolean(formErrors.DiaChi)}
              disabled={isProcessing}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.DiaChi}
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group className="mb-3" controlId="hotelCity">
                <Form.Label>Thành phố</Form.Label>
                <Form.Select
                  value={formValues.ThanhPho}
                  onChange={(e) => setFormValues({ ...formValues, ThanhPho: e.target.value })}
                  isInvalid={Boolean(formErrors.ThanhPho)}
                  disabled={isProcessing}
                >
                  <option value="">Chọn thành phố</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Quảng Ninh">Quảng Ninh</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.ThanhPho}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="hotelStars">
                <Form.Label>Số sao</Form.Label>
                <Form.Select
                  value={formValues.SoSao}
                  onChange={(e) => setFormValues({ ...formValues, SoSao: e.target.value })}
                  isInvalid={Boolean(formErrors.SoSao)}
                  disabled={isProcessing}
                >
                  <option value="">Chọn số sao</option>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.SoSao}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group className="mb-3" controlId="checkInTime">
                <Form.Label>Giờ nhận phòng</Form.Label>
                <Form.Control
                  type="time"
                  value={formValues.GioNhanPhong}
                  onChange={(e) => setFormValues({ ...formValues, GioNhanPhong: e.target.value })}
                  isInvalid={Boolean(formErrors.GioNhanPhong)}
                  disabled={isProcessing}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.GioNhanPhong}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="checkOutTime">
                <Form.Label>Giờ trả phòng</Form.Label>
                <Form.Control
                  type="time"
                  value={formValues.GioTraPhong}
                  onChange={(e) => setFormValues({ ...formValues, GioTraPhong: e.target.value })}
                  isInvalid={Boolean(formErrors.GioTraPhong)}
                  disabled={isProcessing}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.GioTraPhong}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="hotelDescription">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={formValues.MoTa}
              onChange={(e) => setFormValues({ ...formValues, MoTa: e.target.value })}
              isInvalid={Boolean(formErrors.MoTa)}
              disabled={isProcessing}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.MoTa}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="hotelImages">
            <Form.Label>Ảnh khách sạn (Tối đa 4 ảnh)</Form.Label>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={
                  uploadedImages.length >= 4 || isProcessing
                }
                style={{ display: "none" }}
              />
              <Button
                variant="outline-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedImages.length >= 4 || isProcessing}
              >
                Tải lên ảnh ({uploadedImages.length}/4)
              </Button>
            </div>
            {uploadedImages.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {uploadedImages.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <img
                      src={getImagePreviewUrl(file)}
                      alt={`preview-${index}`}
                      style={{ width: "100%", height: 100, objectFit: "cover" }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        padding: "0.25rem 0.5rem",
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </Button>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          <Card className="shadow-sm rounded-4 mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Loại phòng</h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    setRoomTypes((prev) => [
                      ...prev,
                      { tenLoaiPhong: "", soKhachToiDa: 1, kieuGiuong: "", moTa: "" },
                    ])
                  }
                  disabled={isProcessing}
                >
                  Thêm loại phòng
                </Button>
              </div>
              {roomTypes.length === 0 ? (
                <p className="text-secondary">Chưa có loại phòng nào. Thêm loại phòng mới để quản lý.</p>
              ) : (
                roomTypes.map((room, index) => (
                  <div
                    key={index}
                    className="border rounded-3 p-3 mb-3"
                    style={{ background: "#f8fafc" }}
                  >
                    <Row className="g-2 align-items-end">
                      <Col sm={6}>
                        <Form.Group controlId={`roomName-${index}`}>
                          <Form.Label>Tên loại phòng</Form.Label>
                          <Form.Control
                            value={room.tenLoaiPhong}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRoomTypes((prev) =>
                                prev.map((item, idx) =>
                                  idx === index ? { ...item, tenLoaiPhong: value } : item
                                )
                              );
                            }}
                            disabled={isProcessing}
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={3}>
                        <Form.Group controlId={`roomGuests-${index}`}>
                          <Form.Label>Số khách</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            value={room.soKhachToiDa}
                            onChange={(e) => {
                              const value = Number(e.target.value) || 1;
                              setRoomTypes((prev) =>
                                prev.map((item, idx) =>
                                  idx === index ? { ...item, soKhachToiDa: value } : item
                                )
                              );
                            }}
                            disabled={isProcessing}
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={3} className="text-end">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            setRoomTypes((prev) => prev.filter((_, idx) => idx !== index))
                          }
                          disabled={isProcessing}
                        >
                          Xóa
                        </Button>
                      </Col>
                      <Col sm={6}>
                        <Form.Group controlId={`roomBed-${index}`}>
                          <Form.Label>Kiểu giường</Form.Label>
                          <Form.Control
                            value={room.kieuGiuong}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRoomTypes((prev) =>
                                prev.map((item, idx) =>
                                  idx === index ? { ...item, kieuGiuong: value } : item
                                )
                              );
                            }}
                            disabled={isProcessing}
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group controlId={`roomDescription-${index}`}>
                          <Form.Label>Mô tả</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={room.moTa}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRoomTypes((prev) =>
                                prev.map((item, idx) =>
                                  idx === index ? { ...item, moTa: value } : item
                                )
                              );
                            }}
                            disabled={isProcessing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm rounded-4 mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Tiện ích khách sạn</h6>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Form.Control
                    type="text"
                    placeholder="Thêm tiện ích mới"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    disabled={isProcessing}
                  />
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      if (!newAmenity.trim()) return;
                      setAmenities((prev) => [
                        ...prev,
                        { tenTienIch: newAmenity.trim() },
                      ]);
                      setNewAmenity("");
                    }}
                    disabled={isProcessing}
                  >
                    Thêm
                  </Button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {amenities.length === 0 ? (
                  <span className="text-secondary">Chưa có tiện ích. Thêm tiện ích để quản lý.</span>
                ) : (
                  amenities.map((item, index) => (
                    <Badge key={`${item.tenTienIch}-${index}`} bg="secondary" className="d-flex align-items-center gap-2">
                      {item.tenTienIch}
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() =>
                          setAmenities((prev) => prev.filter((_, idx) => idx !== index))
                        }
                        disabled={isProcessing}
                        style={{ padding: "0 0.45rem", lineHeight: 1 }}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Form>
      </BaseModal>

      <Card className="shadow-sm rounded-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0">Danh sách khách sạn</h5>
            <span className="text-secondary">Trang {page}</span>
          </div>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Tên khách sạn</th>
                  <th>Thành phố</th>
                  <th>Địa chỉ</th>
                  <th>Số sao</th>
                  <th>Người tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {hotels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-secondary">
                      Chưa có khách sạn nào.
                    </td>
                  </tr>
                ) : (
                  hotels.map((item: KhachSanType) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/hotels/${item.id}`} className="btn btn-link p-0 text-start">
                          {item.tenKhachSan}
                        </Link>
                      </td>
                      <td>{item.thanhPho}</td>
                      <td>{item.diaChi}</td>
                      <td>{item.soSao}</td>
                      <td>{item.fullName}</td>
                      <td>
                        <Link
                          to={`/hotels/${item.id}`}
                          className="btn btn-outline-secondary btn-sm me-2"
                        >
                          Chi tiết
                        </Link>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(item)}
                          disabled={isProcessing}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          disabled={isProcessing}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}

          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Trang trước
            </Button>
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => setPage((prev) => prev + 1)}
            >
              Trang sau
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default KhachSan;
