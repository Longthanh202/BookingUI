import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faTextHeight,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { getHotelDetailById, CapNhatKhachSan } from "../../api/khachsan/khachsan.api";
import { KhachSan } from "../../types/khachsan/KhachSan";

interface HotelRoomType {
  id?: string;
  tenLoaiPhong?: string;
  soKhachToiDa?: number;
  kieuGiuong?: string;
  moTa?: string;
}

interface HotelAmenity {
  id?: string | number;
  tenTienIch?: string;
}

interface HotelDetailResponse {
  khachSan?: {
    id: string;
    tenKhachSan: string;
    moTa: string;
    diaChi: string;
    thanhPho?: string | null;
    soSao: number;
    gioNhanPhong: string;
    gioTraPhong: string;
    trangThai?: string | null;
  };
  khachSanImages?: Array<{ id: number | string; url: string }>;
  tienIchs?: HotelAmenity[];
  loaiPhongs?: HotelRoomType[];
}

const HotelDetailAdmin = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hotelForm, setHotelForm] = useState({
    tenKhachSan: "",
    diaChi: "",
    thanhPho: "",
    soSao: 1,
    gioNhanPhong: "",
    gioTraPhong: "",
    moTa: "",
  });
  const [roomTypes, setRoomTypes] = useState<HotelRoomType[]>([]);
  const [amenities, setAmenities] = useState<HotelAmenity[]>([]);

  const applyRichText = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
  };

  const handleDescriptionInput = (event: React.FormEvent<HTMLDivElement>) => {
    setHotelForm((prev) => ({ ...prev, moTa: (event.target as HTMLDivElement).innerHTML }));
  };
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddAmenityModal, setShowAddAmenityModal] = useState(false);
  const [newRoomType, setNewRoomType] = useState<HotelRoomType>({ tenLoaiPhong: "", soKhachToiDa: 1, kieuGiuong: "", moTa: "" });
  const [roomModalErrors, setRoomModalErrors] = useState<Record<string, string>>({});
  const [newAmenityLabel, setNewAmenityLabel] = useState("");
  const [existingImages, setExistingImages] = useState<Array<{ id: number | string; url: string }>>([]);
  const [removedImageIds, setRemovedImageIds] = useState<Array<number | string>>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery<HotelDetailResponse>({
    queryKey: ["hotelDetailAdmin", id],
    queryFn: () => getHotelDetailById(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  });

  useEffect(() => {
    if (!data?.khachSan) return;

    setHotelForm({
      tenKhachSan: data.khachSan.tenKhachSan,
      diaChi: data.khachSan.diaChi,
      thanhPho: data.khachSan.thanhPho ?? "",
      soSao: data.khachSan.soSao,
      gioNhanPhong: data.khachSan.gioNhanPhong,
      gioTraPhong: data.khachSan.gioTraPhong,
      moTa: data.khachSan.moTa,
    });

    setRoomTypes(data.loaiPhongs || []);
    setAmenities(data.tienIchs || []);
    setExistingImages(data.khachSanImages || []);
  }, [data]);

  useEffect(() => {
    if (uploadedImages.length) {
      setActiveImage(URL.createObjectURL(uploadedImages[0]));
      return;
    }

    if (existingImages.length) {
      setActiveImage(existingImages[0].url);
    }
  }, [uploadedImages, existingImages]);

  const hotel = data?.khachSan;

  const imageList = useMemo(() => {
    const existing = existingImages.map((image) => ({ id: image.id, url: image.url, type: "existing" as const }));
    const uploaded = uploadedImages.map((file, index) => ({ id: `new-${index}`, url: URL.createObjectURL(file), type: "new" as const, file }));
    return [...existing, ...uploaded];
  }, [existingImages, uploadedImages]);

  const updateMutation = useMutation<any, unknown, FormData, unknown>({
    mutationFn: CapNhatKhachSan,
    onSuccess: () => {
      window.alert("Cập nhật thông tin khách sạn thành công");
      queryClient.invalidateQueries({ queryKey: ["khachsans"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDetailAdmin", id] });
    },
    onError: () => {
      window.alert("Cập nhật khách sạn thất bại");
    },
  });

  const isSaving = updateMutation.status === "pending";

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!hotelForm.tenKhachSan.trim()) errors.tenKhachSan = "Nhập tên khách sạn";
    if (!hotelForm.diaChi.trim()) errors.diaChi = "Nhập địa chỉ";
    if (!hotelForm.thanhPho.trim()) errors.thanhPho = "Nhập thành phố";
    if (!hotelForm.gioNhanPhong) errors.gioNhanPhong = "Chọn giờ nhận phòng";
    if (!hotelForm.gioTraPhong) errors.gioTraPhong = "Chọn giờ trả phòng";
    if (!hotelForm.moTa.trim()) errors.moTa = "Nhập mô tả";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (newFiles.length + existingImages.length + uploadedImages.length > 8) {
      window.alert("Tối đa 8 ảnh hiển thị khách sạn.");
      return;
    }

    setUploadedImages((current) => [...current, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveExistingImage = (imageId: number | string) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
    setRemovedImageIds((prev) => [...prev, imageId]);
  };

  const handleSave = () => {
    if (!validateForm()) {
      window.alert("Vui lòng hoàn thiện form trước khi lưu.");
      return;
    }

    const formData = new FormData();
    formData.append("id", id ?? "");
    formData.append("TenKhachSan", hotelForm.tenKhachSan);
    formData.append("DiaChi", hotelForm.diaChi);
    formData.append("ThanhPho", hotelForm.thanhPho);
    formData.append("SoSao", hotelForm.soSao.toString());
    formData.append("GioNhanPhong", hotelForm.gioNhanPhong);
    formData.append("GioTraPhong", hotelForm.gioTraPhong);
    formData.append("MoTa", hotelForm.moTa);
    formData.append("LoaiPhongs", JSON.stringify(roomTypes));
    formData.append("TienIchs", JSON.stringify(amenities));
    formData.append("RemovedImageIds", JSON.stringify(removedImageIds));

    uploadedImages.forEach((file) => formData.append("Files", file));

    updateMutation.mutate(formData as any);
  };

  if (isLoading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm rounded-4 p-4">
          <h4>Không tìm thấy khách sạn</h4>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h3>{hotel.tenKhachSan}</h3>
          <div className="text-secondary">Quản lý thông tin, ảnh và tiện ích khách sạn</div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-4">
            <Col lg={7}>
              <div className="rounded-4 overflow-hidden mb-3" style={{ minHeight: 320, background: "#f8fafc" }}>
                <Image
                  src={activeImage || existingImages[0]?.url || "https://placehold.co/900x500?text=No+Image"}
                  alt={hotel.tenKhachSan}
                  fluid
                  style={{ width: "100%", height: 320, objectFit: "cover" }}
                />
              </div>
              <div className="d-flex flex-wrap gap-2">
                {imageList.map((item, index) => (
                  <div
                    key={item.id}
                    className="position-relative"
                    style={{ width: 110, height: 90, cursor: "pointer" }}
                  >
                    <Image
                      src={item.url}
                      alt={`hotel-image-${index}`}
                      thumbnail
                      onClick={() => setActiveImage(item.url)}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => {
                        if (item.type === "existing") {
                          handleRemoveExistingImage(item.id);
                        } else {
                          handleRemoveUploadedImage(Number(String(item.id).replace("new-", "")));
                        }
                      }}
                      style={{ padding: "0.25rem 0.45rem" }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div
                  className="border rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 110, height: 90, cursor: "pointer" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center text-secondary">
                    <div style={{ fontSize: 24 }}>+</div>
                    <div>Thêm ảnh</div>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </Col>

            <Col lg={5}>
              <Form>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Form.Group controlId="hotelName">
                      <Form.Label>Tên khách sạn</Form.Label>
                      <Form.Control
                        value={hotelForm.tenKhachSan}
                        onChange={(e) => setHotelForm((prev) => ({ ...prev, tenKhachSan: e.target.value }))}
                        isInvalid={Boolean(formErrors.tenKhachSan)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.tenKhachSan}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group controlId="hotelCity">
                      <Form.Label>Thành phố</Form.Label>
                      <Form.Control
                        value={hotelForm.thanhPho}
                        onChange={(e) => setHotelForm((prev) => ({ ...prev, thanhPho: e.target.value }))}
                        isInvalid={Boolean(formErrors.thanhPho)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.thanhPho}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group controlId="hotelStar">
                      <Form.Label>Số sao</Form.Label>
                      <Form.Select
                        value={hotelForm.soSao}
                        onChange={(e) => setHotelForm((prev) => ({ ...prev, soSao: Number(e.target.value) }))}
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group controlId="checkInTime">
                      <Form.Label>Giờ nhận phòng</Form.Label>
                      <Form.Control
                        type="time"
                        value={hotelForm.gioNhanPhong}
                        onChange={(e) => setHotelForm((prev) => ({ ...prev, gioNhanPhong: e.target.value }))}
                        isInvalid={Boolean(formErrors.gioNhanPhong)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.gioNhanPhong}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group controlId="checkOutTime">
                      <Form.Label>Giờ trả phòng</Form.Label>
                      <Form.Control
                        type="time"
                        value={hotelForm.gioTraPhong}
                        onChange={(e) => setHotelForm((prev) => ({ ...prev, gioTraPhong: e.target.value }))}
                        isInvalid={Boolean(formErrors.gioTraPhong)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.gioTraPhong}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Card className="shadow-sm rounded-4 mb-3">
                      <Card.Body>
                        <Form.Group controlId="hotelDescription">
                          <Form.Label>Mô tả khách sạn</Form.Label>
                          <div className="mb-2 d-flex flex-wrap gap-2">
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("bold")}> <FontAwesomeIcon icon={faBold} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("italic")}> <FontAwesomeIcon icon={faItalic} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("underline")}> <FontAwesomeIcon icon={faUnderline} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("fontSize", "4")}> <FontAwesomeIcon icon={faPlus} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("fontSize", "2")}> <FontAwesomeIcon icon={faMinus} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("justifyLeft")}> <FontAwesomeIcon icon={faAlignLeft} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("justifyCenter")}> <FontAwesomeIcon icon={faAlignCenter} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("justifyRight")}> <FontAwesomeIcon icon={faAlignRight} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("justifyFull")}> <FontAwesomeIcon icon={faAlignJustify} /> </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => applyRichText("insertUnorderedList")}> <FontAwesomeIcon icon={faListUl} /> </Button>
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleDescriptionInput}
                            dangerouslySetInnerHTML={{ __html: hotelForm.moTa }}
                            className="border rounded-3 p-3"
                            style={{ height: 160, width: "100%", overflowY: "auto", background: "#fff" }}
                          />
                          {Boolean(formErrors.moTa) && (
                            <div className="invalid-feedback d-block">{formErrors.moTa}</div>
                          )}
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Loại phòng</h5>
                <Button variant="outline-primary" size="sm" onClick={() => setShowAddRoomModal(true)}>
                  Thêm loại phòng
                </Button>
              </div>
              {roomTypes.length === 0 ? (
                <p className="text-secondary">Chưa có loại phòng nào. Thêm loại phòng cho khách sạn.</p>
              ) : (
                roomTypes.map((room, index) => (
                  <Card key={`room-${index}`} className="mb-3">
                    <Card.Body>
                      <Row className="g-3 align-items-end">
                        <Col sm={6}>
                          <Form.Group controlId={`roomName-${index}`}>
                            <Form.Label>Tên loại phòng</Form.Label>
                            <Form.Control
                              value={room.tenLoaiPhong || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setRoomTypes((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, tenLoaiPhong: value } : item
                                  )
                                );
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col sm={3}>
                          <Form.Group controlId={`roomGuests-${index}`}>
                            <Form.Label>Số khách</Form.Label>
                            <Form.Control
                              type="number"
                              min={1}
                              value={room.soKhachToiDa || 1}
                              onChange={(e) => {
                                const value = Number(e.target.value) || 1;
                                setRoomTypes((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, soKhachToiDa: value } : item
                                  )
                                );
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col sm={3} className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setRoomTypes((prev) => prev.filter((_, idx) => idx !== index))}
                          >
                            Xóa
                          </Button>
                        </Col>
                        <Col sm={6}>
                          <Form.Group controlId={`roomBed-${index}`}>
                            <Form.Label>Kiểu giường</Form.Label>
                            <Form.Control
                              value={room.kieuGiuong || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setRoomTypes((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, kieuGiuong: value } : item
                                  )
                                );
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group controlId={`roomDesc-${index}`}>
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={room.moTa || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setRoomTypes((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, moTa: value } : item
                                  )
                                );
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Tiện ích</h5>
                <Button variant="outline-primary" size="sm" onClick={() => setShowAddAmenityModal(true)}>
                  Thêm tiện ích
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {amenities.length === 0 ? (
                  <span className="text-secondary">Chưa có tiện ích nào.</span>
                ) : (
                  amenities.map((item, index) => (
                    <Badge key={`amenity-${index}`} bg="secondary" className="d-flex align-items-center gap-2 p-2">
                      {item.tenTienIch}
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => setAmenities((prev) => prev.filter((_, idx) => idx !== index))}
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
        </Col>
      </Row>

      <Modal show={showAddRoomModal} onHide={() => setShowAddRoomModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm loại phòng mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="newRoomTypeName">
              <Form.Label>Tên loại phòng</Form.Label>
              <Form.Control
                type="text"
                value={newRoomType.tenLoaiPhong}
                onChange={(e) => setNewRoomType((prev) => ({ ...prev, tenLoaiPhong: e.target.value }))}
                isInvalid={Boolean(roomModalErrors.tenLoaiPhong)}
              />
              <Form.Control.Feedback type="invalid">
                {roomModalErrors.tenLoaiPhong}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="newRoomGuests">
              <Form.Label>Số khách tối đa</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={newRoomType.soKhachToiDa}
                onChange={(e) => setNewRoomType((prev) => ({ ...prev, soKhachToiDa: Number(e.target.value) || 1 }))}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newRoomBedType">
              <Form.Label>Kiểu giường</Form.Label>
              <Form.Control
                type="text"
                value={newRoomType.kieuGiuong}
                onChange={(e) => setNewRoomType((prev) => ({ ...prev, kieuGiuong: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newRoomDescription">
              <Form.Label>Mô tả loại phòng</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newRoomType.moTa}
                onChange={(e) => setNewRoomType((prev) => ({ ...prev, moTa: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddRoomModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!newRoomType.tenLoaiPhong || !newRoomType.tenLoaiPhong.trim()) {
                setRoomModalErrors({ tenLoaiPhong: "Nhập tên loại phòng" });
                return;
              }
              setRoomTypes((prev) => [...prev, newRoomType]);
              setNewRoomType({ tenLoaiPhong: "", soKhachToiDa: 1, kieuGiuong: "", moTa: "" });
              setRoomModalErrors({});
              setShowAddRoomModal(false);
            }}
          >
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddAmenityModal} onHide={() => setShowAddAmenityModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm tiện ích</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="newAmenityLabel">
              <Form.Label>Tên tiện ích</Form.Label>
              <Form.Control
                type="text"
                value={newAmenityLabel}
                onChange={(e) => setNewAmenityLabel(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddAmenityModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!newAmenityLabel.trim()) return;
              setAmenities((prev) => [...prev, { tenTienIch: newAmenityLabel.trim() }]);
              setNewAmenityLabel("");
              setShowAddAmenityModal(false);
            }}
          >
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HotelDetailAdmin;
