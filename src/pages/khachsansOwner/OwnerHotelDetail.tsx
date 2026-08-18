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
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Table from "react-bootstrap/Table";

import {
  faArrowLeft,
  faSave,
  faPlus,
  faTrash,
  faImage,
  faHotel,
  faBed,
  faWifi,
  faCalendarCheck,
  faClock,
  faLocationDot,
  faStar,
  faUsers,
  faMoneyBill,
  faCreditCard,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  getHotelDetailById,
  CapNhatKhachSan,
} from "../../api/khachsan/khachsan.api";

import {
  getOwnerBookings,
  checkInBooking,
  checkOutBooking,
  confirmBooking
} from "../../api/booking/booking.api";
import { getOwnerRoomTypes } from "../../api/loaiphong/loaiphong.api";

import { RoomResponse } from "../../types/loaiphong/RoomResponse";

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

interface HotelDetailData {
  id: string;
  tenKhachSan: string;
  moTa: string;
  diaChi: string;
  thanhPho?: string | null;
  soSao: number;
  gioNhanPhong: string;
  gioTraPhong: string;
  trangThai?: string | null;
  khachSanImages?: Array<{
    id: number | string;
    url: string;
  }>;
  tienIchs?: HotelAmenity[];
  loaiPhongs?: HotelRoomType[];
}

interface HotelDetailResponse {
  khachSan?: HotelDetailData;
  khachSanImages?: Array<{
    id: number | string;
    url: string;
  }>;
  tienIchs?: HotelAmenity[];
  loaiPhongs?: HotelRoomType[];
}

type HotelDetailApiResponse =
  | HotelDetailResponse
  | HotelDetailData;

const isHotelDetailResponse = (
  value: HotelDetailApiResponse
): value is HotelDetailResponse => {
  return Boolean(
    value &&
      typeof value === "object" &&
      "khachSan" in value
  );
};

const OwnerHotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const [showAddRoomModal, setShowAddRoomModal] =
    useState(false);

  const [showAddAmenityModal, setShowAddAmenityModal] =
    useState(false);

  const [newRoomType, setNewRoomType] =
    useState<HotelRoomType>({
      tenLoaiPhong: "",
      soKhachToiDa: 1,
      kieuGiuong: "",
      moTa: "",
    });

  const [roomModalErrors, setRoomModalErrors] =
    useState<Record<string, string>>({});

  const [newAmenityLabel, setNewAmenityLabel] =
    useState("");

  const [existingImages, setExistingImages] =
    useState<
      Array<{
        id: number | string;
        url: string;
      }>
    >([]);

  const [removedImageIds, setRemovedImageIds] =
    useState<Array<number | string>>([]);

  const [uploadedImages, setUploadedImages] =
    useState<File[]>([]);

  const [activeImage, setActiveImage] =
    useState<string>("");

  const [formErrors, setFormErrors] =
    useState<Record<string, string>>({});

  /*
  |--------------------------------------------------------------------------
  | HOTEL DETAIL
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
    isError,
  } = useQuery<HotelDetailApiResponse>({
    queryKey: ["hotelDetailOwner", id],
    queryFn: () => getHotelDetailById(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  });

  const checkInMutation = useMutation({
  mutationFn: (bookingId: string) =>
    checkInBooking(bookingId),

  onSuccess: () => {
    window.alert("Check-in thành công!");

    queryClient.invalidateQueries({
      queryKey: ["hotelBookings", id],
    });
  },

  onError: (error: any) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data ||
      "Check-in thất bại";

    window.alert(message);
  },
});

const checkOutMutation = useMutation({
  mutationFn: (bookingId: string) =>
    checkOutBooking(bookingId),

  onSuccess: () => {
    window.alert("Check-out thành công!");

    queryClient.invalidateQueries({
      queryKey: ["hotelBookings", id],
    });
  },

  onError: (error: any) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data ||
      "Check-out thất bại";

    window.alert(message);
  },
});

const confirmMutation = useMutation({
  mutationFn: confirmBooking,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["hotelBookings", id],
    });

    window.alert("Xác nhận đặt phòng thành công");
  },
  onError: () => {
    window.alert("Xác nhận đặt phòng thất bại");
  },
});

const handleCheckIn = (bookingId: string) => {
  const confirmed = window.confirm(
    "Bạn có chắc chắn muốn check-in cho booking này?"
  );

  if (!confirmed) {
    return;
  }

  checkInMutation.mutate(bookingId);
};

const handleConfirm = (bookingId: string) => {
  confirmMutation.mutate(bookingId);
};

const handleCheckOut = (bookingId: string) => {
  const confirmed = window.confirm(
    "Bạn có chắc chắn muốn check-out cho booking này?"
  );

  if (!confirmed) {
    return;
  }

  checkOutMutation.mutate(bookingId);
};
  /*
  |--------------------------------------------------------------------------
  | BOOKINGS
  |--------------------------------------------------------------------------
  */

  const {
    data: ownerBookingsResp,
    isLoading: isBookingsLoading,
  } = useQuery<
    {
      data: any[];
      totalRow?: number;
      totalPage?: number;
    },
    Error
  >({
    queryKey: ["hotelBookings", id],
    queryFn: () =>
      getOwnerBookings({
        khachSanId: id ?? "",
        page: 1,
        pageSize: 10,
      }),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  /*
  |--------------------------------------------------------------------------
  | ROOM TYPES
  |--------------------------------------------------------------------------
  */

  const { data: ownerRoomTypes } = useQuery<
    RoomResponse[],
    Error
  >({
    queryKey: ["ownerRoomTypes", id],
    queryFn: () =>
      getOwnerRoomTypes(id ?? ""),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!data) return;

    const hotelRoot = isHotelDetailResponse(data)
      ? data.khachSan
      : data;

    if (!hotelRoot) return;

    setHotelForm({
      tenKhachSan: hotelRoot.tenKhachSan ?? "",
      diaChi: hotelRoot.diaChi ?? "",
      thanhPho: hotelRoot.thanhPho ?? "",
      soSao: hotelRoot.soSao ?? 1,
      gioNhanPhong: hotelRoot.gioNhanPhong ?? "",
      gioTraPhong: hotelRoot.gioTraPhong ?? "",
      moTa: hotelRoot.moTa ?? "",
    });

    setRoomTypes(
      isHotelDetailResponse(data)
        ? data.loaiPhongs || []
        : data.loaiPhongs || []
    );

    setAmenities(
      isHotelDetailResponse(data)
        ? data.tienIchs || []
        : data.tienIchs || []
    );

    setExistingImages(
      isHotelDetailResponse(data)
        ? data.khachSanImages || []
        : data.khachSanImages || []
    );
  }, [data]);

  useEffect(() => {
    if (ownerRoomTypes?.length) {
      setRoomTypes(ownerRoomTypes);
    }
  }, [ownerRoomTypes]);

  /*
  |--------------------------------------------------------------------------
  | HOTEL
  |--------------------------------------------------------------------------
  */

  const hotel = data
    ? isHotelDetailResponse(data)
      ? data.khachSan
      : data
    : undefined;

  /*
  |--------------------------------------------------------------------------
  | IMAGES
  |--------------------------------------------------------------------------
  */

  const imageList = useMemo(() => {
    const existing = existingImages.map(
      (image) => ({
        id: image.id,
        url: image.url,
        type: "existing" as const,
      })
    );

    const uploaded = uploadedImages.map(
      (file, index) => ({
        id: `new-${index}`,
        url: URL.createObjectURL(file),
        type: "new" as const,
        file,
      })
    );

    return [...existing, ...uploaded];
  }, [existingImages, uploadedImages]);

  useEffect(() => {
    if (uploadedImages.length > 0) {
      setActiveImage(
        URL.createObjectURL(uploadedImages[0])
      );
      return;
    }

    if (existingImages.length > 0) {
      setActiveImage(existingImages[0].url);
    }
  }, [uploadedImages, existingImages]);

  /*
  |--------------------------------------------------------------------------
  | BOOKINGS
  |--------------------------------------------------------------------------
  */

  const hotelBookings = useMemo(() => {
    return ownerBookingsResp?.data ?? [];
  }, [ownerBookingsResp]);

  /*
  |--------------------------------------------------------------------------
  | FORMAT
  |--------------------------------------------------------------------------
  */

  const formatDate = (iso?: string) => {
    if (!iso) return "-";

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
      return iso;
    }

    const pad = (n: number) =>
      String(n).padStart(2, "0");

    return `${pad(d.getDate())}/${pad(
      d.getMonth() + 1
    )}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

  const getPaymentVariant = (
    method?: string
  ) => {
    if (!method) return "secondary";

    switch (method.toUpperCase()) {
      case "MOMO":
        return "warning";

      case "CASH":
      case "TIEN_MAT":
        return "success";

      case "CARD":
      case "VISA":
      case "MASTERCARD":
        return "primary";

      default:
        return "secondary";
    }
  };

  const computeTotalPrice = (b: any) => {
    if (!Array.isArray(b.chiTietDatPhongs)) {
      return 0;
    }

    return b.chiTietDatPhongs.reduce(
      (sum: number, ct: any) => {
        const gia = Number(ct.gia) || 0;

        const phCount = Array.isArray(ct.phongs)
          ? ct.phongs.length
          : 1;

        return sum + gia * phCount;
      },
      0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  const updateMutation = useMutation<
    any,
    unknown,
    FormData,
    unknown
  >({
    mutationFn: CapNhatKhachSan,

    onSuccess: () => {
      window.alert(
        "Cập nhật thông tin khách sạn thành công"
      );

      queryClient.invalidateQueries({
        queryKey: ["khachsans"],
      });

      queryClient.invalidateQueries({
        queryKey: ["hotelDetailOwner", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["ownerRoomTypes", id],
      });
    },

    onError: () => {
      window.alert(
        "Cập nhật khách sạn thất bại"
      );
    },
  });

  const isSaving =
    updateMutation.status === "pending";

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!hotelForm.tenKhachSan.trim()) {
      errors.tenKhachSan =
        "Nhập tên khách sạn";
    }

    if (!hotelForm.diaChi.trim()) {
      errors.diaChi = "Nhập địa chỉ";
    }

    if (!hotelForm.thanhPho.trim()) {
      errors.thanhPho =
        "Nhập thành phố";
    }

    if (!hotelForm.gioNhanPhong) {
      errors.gioNhanPhong =
        "Chọn giờ nhận phòng";
    }

    if (!hotelForm.gioTraPhong) {
      errors.gioTraPhong =
        "Chọn giờ trả phòng";
    }

    if (!hotelForm.moTa.trim()) {
      errors.moTa = "Nhập mô tả";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files) return;

    const newFiles = Array.from(files);

    if (
      newFiles.length +
        existingImages.length +
        uploadedImages.length >
      8
    ) {
      window.alert(
        "Tối đa 8 ảnh cho khách sạn."
      );

      return;
    }

    setUploadedImages((current) => [
      ...current,
      ...newFiles,
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveUploadedImage = (
    index: number
  ) => {
    setUploadedImages((prev) =>
      prev.filter(
        (_, idx) => idx !== index
      )
    );
  };

  const handleRemoveExistingImage = (
    imageId: number | string
  ) => {
    setExistingImages((prev) =>
      prev.filter(
        (image) => image.id !== imageId
      )
    );

    setRemovedImageIds((prev) => [
      ...prev,
      imageId,
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = () => {
    if (!validateForm()) {
      window.alert(
        "Vui lòng hoàn thiện thông tin trước khi lưu."
      );

      return;
    }

    const formData = new FormData();

    formData.append("id", id ?? "");

    formData.append(
      "TenKhachSan",
      hotelForm.tenKhachSan
    );

    formData.append(
      "DiaChi",
      hotelForm.diaChi
    );

    formData.append(
      "ThanhPho",
      hotelForm.thanhPho
    );

    formData.append(
      "SoSao",
      hotelForm.soSao.toString()
    );

    formData.append(
      "GioNhanPhong",
      hotelForm.gioNhanPhong
    );

    formData.append(
      "GioTraPhong",
      hotelForm.gioTraPhong
    );

    formData.append(
      "MoTa",
      hotelForm.moTa
    );

    formData.append(
      "LoaiPhongs",
      JSON.stringify(roomTypes)
    );

    formData.append(
      "TienIchs",
      JSON.stringify(amenities)
    );

    formData.append(
      "RemovedImageIds",
      JSON.stringify(removedImageIds)
    );

    uploadedImages.forEach((file) => {
      formData.append("Files", file);
    });

    updateMutation.mutate(formData);
  };

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

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
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-5 text-center">
            <div
              className="rounded-circle bg-light d-inline-flex
              align-items-center justify-content-center mb-3"
              style={{
                width: 70,
                height: 70,
              }}
            >
              <FontAwesomeIcon
                icon={faHotel}
                size="xl"
                className="text-secondary"
              />
            </div>

            <h4>
              Không tìm thấy khách sạn
            </h4>

            <p className="text-secondary">
              Khách sạn có thể đã bị xóa
              hoặc không tồn tại.
            </p>

            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div
      style={{
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          background: "#fff",
          borderBottom:
            "1px solid #e9ecef",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Container fluid>
          <div
            className="d-flex justify-content-between
            align-items-center flex-wrap gap-3"
            style={{
              minHeight: 82,
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <Button
                variant="light"
                className="rounded-circle"
                style={{
                  width: 42,
                  height: 42,
                }}
                onClick={() => navigate(-1)}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                />
              </Button>

              <div>
                <div
                  className="text-secondary"
                  style={{
                    fontSize: 13,
                  }}
                >
                  QUẢN LÝ KHÁCH SẠN
                </div>

                <div
                  className="fw-bold"
                  style={{
                    fontSize: 22,
                    lineHeight: 1.3,
                  }}
                >
                  {hotel.tenKhachSan}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Badge
                bg={
                  hotel.trangThai ===
                  "DA_DUYET"
                    ? "success"
                    : "warning"
                }
                className="px-3 py-2"
              >
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="me-2"
                />

                {hotel.trangThai ===
                "DA_DUYET"
                  ? "Đã duyệt"
                  : "Chờ duyệt"}
              </Badge>

              <Button
                variant="primary"
                className="px-4"
                onClick={handleSave}
                disabled={isSaving}
              >
                <FontAwesomeIcon
                  icon={faSave}
                  className="me-2"
                />

                {isSaving
                  ? "Đang lưu..."
                  : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container
        fluid
        className="py-4 px-3 px-lg-4"
      >
        {/* SUMMARY */}

        <Row className="g-3 mb-4">
          <Col md={6} xl={3}>
            <SummaryCard
              icon={faHotel}
              title="Khách sạn"
              value={hotel.tenKhachSan}
              subtitle={hotel.thanhPho || "-"}
            />
          </Col>

          <Col md={6} xl={3}>
            <SummaryCard
              icon={faStar}
              title="Xếp hạng"
              value={`${hotelForm.soSao}/5`}
              subtitle="Số sao khách sạn"
            />
          </Col>

          <Col md={6} xl={3}>
            <SummaryCard
              icon={faBed}
              title="Loại phòng"
              value={roomTypes.length}
              subtitle="Loại phòng đang quản lý"
            />
          </Col>

          <Col md={6} xl={3}>
            <SummaryCard
              icon={faWifi}
              title="Tiện ích"
              value={amenities.length}
              subtitle="Tiện ích khách sạn"
            />
          </Col>
        </Row>

        {/* MAIN */}

        <Card
          className="border-0 shadow-sm"
          style={{
            borderRadius: 18,
          }}
        >
          <Card.Body className="p-0">
            <Tabs
              defaultActiveKey="overview"
              id="owner-hotel-tabs"
              className="px-3 px-lg-4 pt-3"
            >
              {/* ===================================================== */}
              {/* OVERVIEW */}
              {/* ===================================================== */}

              <Tab
                eventKey="overview"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={faHotel}
                      className="me-2"
                    />
                    Tổng quan
                  </span>
                }
              >
                <div className="p-3 p-lg-4">
                  <Row className="g-4">
                    {/* IMAGE */}

                    <Col lg={7}>
                      <SectionTitle
                        title="Hình ảnh khách sạn"
                        subtitle="Quản lý hình ảnh hiển thị của khách sạn"
                      />

                      <div
                        className="overflow-hidden mb-3"
                        style={{
                          height: 400,
                          borderRadius: 16,
                          background:
                            "#eef1f5",
                        }}
                      >
                        <Image
                          src={
                            activeImage ||
                            existingImages[0]
                              ?.url ||
                            "https://placehold.co/1000x600?text=No+Image"
                          }
                          alt={
                            hotel.tenKhachSan
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {imageList.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={item.id}
                              className="position-relative"
                              style={{
                                width: 95,
                                height: 75,
                              }}
                            >
                              <Image
                                src={item.url}
                                alt={`hotel-${index}`}
                                rounded
                                onClick={() =>
                                  setActiveImage(
                                    item.url
                                  )
                                }
                                style={{
                                  width:
                                    "100%",
                                  height:
                                    "100%",
                                  objectFit:
                                    "cover",
                                  cursor:
                                    "pointer",
                                  border:
                                    activeImage ===
                                    item.url
                                      ? "3px solid #0d6efd"
                                      : "1px solid #dee2e6",
                                }}
                              />

                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute"
                                style={{
                                  top: 3,
                                  right: 3,
                                  width: 24,
                                  height: 24,
                                  padding: 0,
                                  borderRadius:
                                    "50%",
                                }}
                                onClick={() => {
                                  if (
                                    item.type ===
                                    "existing"
                                  ) {
                                    handleRemoveExistingImage(
                                      item.id
                                    );
                                  } else {
                                    handleRemoveUploadedImage(
                                      Number(
                                        String(
                                          item.id
                                        ).replace(
                                          "new-",
                                          ""
                                        )
                                      )
                                    );
                                  }
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    faTrash
                                  }
                                  style={{
                                    fontSize: 10,
                                  }}
                                />
                              </Button>
                            </div>
                          )
                        )}

                        {imageList.length <
                          8 && (
                          <div
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            className="border rounded-3
                            d-flex flex-column
                            align-items-center
                            justify-content-center"
                            style={{
                              width: 95,
                              height: 75,
                              cursor:
                                "pointer",
                              borderStyle:
                                "dashed",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faPlus}
                              className="text-primary"
                            />

                            <small className="text-secondary mt-1">
                              Thêm ảnh
                            </small>
                          </div>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        style={{
                          display: "none",
                        }}
                        onChange={
                          handleImageUpload
                        }
                      />
                    </Col>

                    {/* HOTEL INFORMATION */}

                    <Col lg={5}>
                      <SectionTitle
                        title="Thông tin cơ bản"
                        subtitle="Thông tin chung của khách sạn"
                      />

                      <Card
                        className="border-0"
                        style={{
                          background:
                            "#f8f9fc",
                          borderRadius: 16,
                        }}
                      >
                        <Card.Body className="p-4">
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                              Tên khách sạn
                            </Form.Label>

                            <Form.Control
                              value={
                                hotelForm.tenKhachSan
                              }
                              onChange={(e) =>
                                setHotelForm(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    tenKhachSan:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              isInvalid={Boolean(
                                formErrors.tenKhachSan
                              )}
                            />

                            <Form.Control.Feedback type="invalid">
                              {
                                formErrors.tenKhachSan
                              }
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                              Địa chỉ
                            </Form.Label>

                            <div className="position-relative">
                              <FontAwesomeIcon
                                icon={
                                  faLocationDot
                                }
                                className="position-absolute text-secondary"
                                style={{
                                  left: 13,
                                  top: 12,
                                }}
                              />

                              <Form.Control
                                className="ps-5"
                                value={
                                  hotelForm.diaChi
                                }
                                onChange={(
                                  e
                                ) =>
                                  setHotelForm(
                                    (
                                      prev
                                    ) => ({
                                      ...prev,
                                      diaChi:
                                        e
                                          .target
                                          .value,
                                    })
                                  )
                                }
                                isInvalid={Boolean(
                                  formErrors.diaChi
                                )}
                              />
                            </div>

                            <Form.Control.Feedback type="invalid">
                              {
                                formErrors.diaChi
                              }
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">
                                  Thành phố
                                </Form.Label>

                                <Form.Select
                                  value={
                                    hotelForm.thanhPho
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setHotelForm(
                                      (
                                        prev
                                      ) => ({
                                        ...prev,
                                        thanhPho:
                                          e
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                  isInvalid={Boolean(
                                    formErrors.thanhPho
                                  )}
                                >
                                  <option value="">
                                    Chọn thành phố
                                  </option>

                                  <option value="Hồ Chí Minh">
                                    Hồ Chí Minh
                                  </option>

                                  <option value="Hà Nội">
                                    Hà Nội
                                  </option>

                                  <option value="Đà Nẵng">
                                    Đà Nẵng
                                  </option>

                                  <option value="Cần Thơ">
                                    Cần Thơ
                                  </option>

                                  <option value="Quảng Ninh">
                                    Quảng Ninh
                                  </option>
                                </Form.Select>
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">
                                  Số sao
                                </Form.Label>

                                <Form.Select
                                  value={
                                    hotelForm.soSao
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setHotelForm(
                                      (
                                        prev
                                      ) => ({
                                        ...prev,
                                        soSao:
                                          Number(
                                            e
                                              .target
                                              .value
                                          ),
                                      })
                                    )
                                  }
                                >
                                  {[1, 2, 3, 4, 5].map(
                                    (
                                      star
                                    ) => (
                                      <option
                                        key={
                                          star
                                        }
                                        value={
                                          star
                                        }
                                      >
                                        {star} sao
                                      </option>
                                    )
                                  )}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="g-3 mt-1">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">
                                  <FontAwesomeIcon
                                    icon={
                                      faClock
                                    }
                                    className="me-2 text-primary"
                                  />
                                  Nhận phòng
                                </Form.Label>

                                <Form.Control
                                  type="time"
                                  value={
                                    hotelForm.gioNhanPhong
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setHotelForm(
                                      (
                                        prev
                                      ) => ({
                                        ...prev,
                                        gioNhanPhong:
                                          e
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">
                                  <FontAwesomeIcon
                                    icon={
                                      faClock
                                    }
                                    className="me-2 text-danger"
                                  />
                                  Trả phòng
                                </Form.Label>

                                <Form.Control
                                  type="time"
                                  value={
                                    hotelForm.gioTraPhong
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setHotelForm(
                                      (
                                        prev
                                      ) => ({
                                        ...prev,
                                        gioTraPhong:
                                          e
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* DESCRIPTION */}

                  <Card
                    className="border-0 mt-4"
                    style={{
                      background:
                        "#f8f9fc",
                      borderRadius: 16,
                    }}
                  >
                    <Card.Body className="p-4">
                      <SectionTitle
                        title="Mô tả khách sạn"
                        subtitle="Thông tin giới thiệu về khách sạn"
                      />

                      <Form.Control
                        as="textarea"
                        rows={7}
                        value={
                          hotelForm.moTa
                        }
                        onChange={(e) =>
                          setHotelForm(
                            (prev) => ({
                              ...prev,
                              moTa:
                                e.target
                                  .value,
                            })
                          )
                        }
                        isInvalid={Boolean(
                          formErrors.moTa
                        )}
                      />

                      <Form.Control.Feedback type="invalid">
                        {formErrors.moTa}
                      </Form.Control.Feedback>
                    </Card.Body>
                  </Card>
                </div>
              </Tab>

              {/* ===================================================== */}
              {/* ROOM TYPES */}
              {/* ===================================================== */}

              <Tab
                eventKey="rooms"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={faBed}
                      className="me-2"
                    />
                    Loại phòng
                    <Badge
                      bg="primary"
                      className="ms-2"
                    >
                      {roomTypes.length}
                    </Badge>
                  </span>
                }
              >
                <div className="p-3 p-lg-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="fw-bold mb-1">
                        Loại phòng
                      </h5>

                      <div className="text-secondary small">
                        Quản lý các loại phòng
                        của khách sạn
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() =>
                        setShowAddRoomModal(
                          true
                        )
                      }
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="me-2"
                      />

                      Thêm loại phòng
                    </Button>
                  </div>

                  {roomTypes.length ===
                  0 ? (
                    <EmptyState
                      icon={faBed}
                      title="Chưa có loại phòng"
                      description="Hãy thêm loại phòng đầu tiên cho khách sạn."
                      buttonText="Thêm loại phòng"
                      onClick={() =>
                        setShowAddRoomModal(
                          true
                        )
                      }
                    />
                  ) : (
                    <Row className="g-3">
                      {roomTypes.map(
                        (
                          room,
                          index
                        ) => (
                          <Col
                            xl={6}
                            key={
                              room.id ??
                              `room-${index}`
                            }
                          >
                            <Card
                              className="border-0 shadow-sm h-100"
                              style={{
                                borderRadius:
                                  16,
                              }}
                            >
                              <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div className="d-flex align-items-center gap-3">
                                    <div
                                      className="rounded-3 d-flex align-items-center justify-content-center"
                                      style={{
                                        width: 48,
                                        height: 48,
                                        background:
                                          "#eaf2ff",
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          faBed
                                        }
                                        className="text-primary"
                                      />
                                    </div>

                                    <div>
                                      <div className="fw-bold">
                                        {room.tenLoaiPhong ||
                                          "Chưa đặt tên"}
                                      </div>

                                      <small className="text-secondary">
                                        Loại phòng #
                                        {index +
                                          1}
                                      </small>
                                    </div>
                                  </div>

                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="rounded-circle"
                                    style={{
                                      width: 34,
                                      height: 34,
                                    }}
                                    onClick={() =>
                                      setRoomTypes(
                                        (
                                          prev
                                        ) =>
                                          prev.filter(
                                            (
                                              _,
                                              idx
                                            ) =>
                                              idx !==
                                              index
                                          )
                                      )
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        faTrash
                                      }
                                    />
                                  </Button>
                                </div>

                                <Row className="g-3">
                                  <Col md={6}>
                                    <Form.Group>
                                      <Form.Label className="small fw-semibold">
                                        Tên loại phòng
                                      </Form.Label>

                                      <Form.Control
                                        value={
                                          room.tenLoaiPhong ||
                                          ""
                                        }
                                        onChange={(
                                          e
                                        ) => {
                                          const value =
                                            e
                                              .target
                                              .value;

                                          setRoomTypes(
                                            (
                                              prev
                                            ) =>
                                              prev.map(
                                                (
                                                  item,
                                                  idx
                                                ) =>
                                                  idx ===
                                                  index
                                                    ? {
                                                        ...item,
                                                        tenLoaiPhong:
                                                          value,
                                                      }
                                                    : item
                                              )
                                          );
                                        }}
                                      />
                                    </Form.Group>
                                  </Col>

                                  <Col md={6}>
                                    <Form.Group>
                                      <Form.Label className="small fw-semibold">
                                        Số khách tối đa
                                      </Form.Label>

                                      <div className="position-relative">
                                        <FontAwesomeIcon
                                          icon={
                                            faUsers
                                          }
                                          className="position-absolute text-secondary"
                                          style={{
                                            left: 12,
                                            top: 12,
                                          }}
                                        />

                                        <Form.Control
                                          className="ps-5"
                                          type="number"
                                          min={
                                            1
                                          }
                                          value={
                                            room.soKhachToiDa ||
                                            1
                                          }
                                          onChange={(
                                            e
                                          ) => {
                                            const value =
                                              Number(
                                                e
                                                  .target
                                                  .value
                                              ) ||
                                              1;

                                            setRoomTypes(
                                              (
                                                prev
                                              ) =>
                                                prev.map(
                                                  (
                                                    item,
                                                    idx
                                                  ) =>
                                                    idx ===
                                                    index
                                                      ? {
                                                          ...item,
                                                          soKhachToiDa:
                                                            value,
                                                        }
                                                      : item
                                                )
                                            );
                                          }}
                                        />
                                      </div>
                                    </Form.Group>
                                  </Col>

                                  <Col md={12}>
                                    <Form.Group>
                                      <Form.Label className="small fw-semibold">
                                        Kiểu giường
                                      </Form.Label>

                                      <Form.Control
                                        value={
                                          room.kieuGiuong ||
                                          ""
                                        }
                                        onChange={(
                                          e
                                        ) => {
                                          const value =
                                            e
                                              .target
                                              .value;

                                          setRoomTypes(
                                            (
                                              prev
                                            ) =>
                                              prev.map(
                                                (
                                                  item,
                                                  idx
                                                ) =>
                                                  idx ===
                                                  index
                                                    ? {
                                                        ...item,
                                                        kieuGiuong:
                                                          value,
                                                      }
                                                    : item
                                              )
                                          );
                                        }}
                                      />
                                    </Form.Group>
                                  </Col>

                                  <Col md={12}>
                                    <Form.Group>
                                      <Form.Label className="small fw-semibold">
                                        Mô tả
                                      </Form.Label>

                                      <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={
                                          room.moTa ||
                                          ""
                                        }
                                        onChange={(
                                          e
                                        ) => {
                                          const value =
                                            e
                                              .target
                                              .value;

                                          setRoomTypes(
                                            (
                                              prev
                                            ) =>
                                              prev.map(
                                                (
                                                  item,
                                                  idx
                                                ) =>
                                                  idx ===
                                                  index
                                                    ? {
                                                        ...item,
                                                        moTa:
                                                          value,
                                                      }
                                                    : item
                                              )
                                          );
                                        }}
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      )}
                    </Row>
                  )}
                </div>
              </Tab>

              {/* ===================================================== */}
              {/* AMENITIES */}
              {/* ===================================================== */}

              <Tab
                eventKey="amenities"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={faWifi}
                      className="me-2"
                    />

                    Tiện ích

                    <Badge
                      bg="success"
                      className="ms-2"
                    >
                      {amenities.length}
                    </Badge>
                  </span>
                }
              >
                <div className="p-3 p-lg-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="fw-bold mb-1">
                        Tiện ích khách sạn
                      </h5>

                      <div className="text-secondary small">
                        Các dịch vụ và tiện nghi
                        khách sạn cung cấp
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() =>
                        setShowAddAmenityModal(
                          true
                        )
                      }
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="me-2"
                      />

                      Thêm tiện ích
                    </Button>
                  </div>

                  {amenities.length ===
                  0 ? (
                    <EmptyState
                      icon={faWifi}
                      title="Chưa có tiện ích"
                      description="Thêm các tiện ích để khách hàng biết khách sạn cung cấp những gì."
                      buttonText="Thêm tiện ích"
                      onClick={() =>
                        setShowAddAmenityModal(
                          true
                        )
                      }
                    />
                  ) : (
                    <Card
                      className="border-0 shadow-sm"
                      style={{
                        borderRadius: 16,
                      }}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex flex-wrap gap-3">
                          {amenities.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={`amenity-${index}`}
                                className="d-flex align-items-center gap-2 px-3 py-2"
                                style={{
                                  background:
                                    "#f0f7ff",
                                  border:
                                    "1px solid #dbeafe",
                                  borderRadius:
                                    30,
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    faCheckCircle
                                  }
                                  className="text-primary"
                                  style={{
                                    fontSize: 13,
                                  }}
                                />

                                <span className="fw-medium">
                                  {
                                    item.tenTienIch
                                  }
                                </span>

                                <Button
                                  variant="link"
                                  className="p-0 text-danger"
                                  onClick={() =>
                                    setAmenities(
                                      (
                                        prev
                                      ) =>
                                        prev.filter(
                                          (
                                            _,
                                            idx
                                          ) =>
                                            idx !==
                                            index
                                        )
                                    )
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      faTrash
                                    }
                                    style={{
                                      fontSize: 12,
                                    }}
                                  />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              </Tab>

              {/* ===================================================== */}
              {/* BOOKINGS */}
              {/* ===================================================== */}

              <Tab
                eventKey="bookings"
                title={
                  <span>
                    <FontAwesomeIcon
                      icon={
                        faCalendarCheck
                      }
                      className="me-2"
                    />

                    Đặt phòng

                    <Badge
                      bg="dark"
                      className="ms-2"
                    >
                      {hotelBookings.length}
                    </Badge>
                  </span>
                }
              >
                <div className="p-3 p-lg-4">
                  <div className="mb-4">
                    <h5 className="fw-bold mb-1">
                      Lịch sử đặt phòng
                    </h5>

                    <div className="text-secondary small">
                      Theo dõi các booking
                      của khách hàng
                    </div>
                  </div>

                  {isBookingsLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" />
                    </div>
                  ) : hotelBookings.length ===
                    0 ? (
                    <EmptyState
                      icon={faCalendarCheck}
                      title="Chưa có booking"
                      description="Khách sạn hiện chưa có lượt đặt phòng nào."
                    />
                  ) : (
                    <Card
                      className="border-0 shadow-sm overflow-hidden"
                      style={{
                        borderRadius: 16,
                      }}
                    >
                      <Table
                        responsive
                        hover
                        className="mb-0 align-middle"
                      >
                        <thead
                          style={{
                            background:
                              "#f8f9fc",
                          }}
                        >
                          <tr>
                            <th className="px-4 py-3">
                              Trạng thái
                            </th>
                            <th>
                              Ngày nhận phòng
                              </th>
                            <th>
                              Ngày trả phòng
                              </th>
                            <th>
                              Ngày tạo
                            </th>

                            <th>
                              Loại phòng
                            </th>

                            <th>
                              Phòng
                            </th>

                            <th>
                              Tổng tiền
                            </th>

                            <th>
                              Thanh toán
                            </th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>

                        <tbody>
                          {hotelBookings.map(
                            (b: any) => {
                              const types =
                                Array.isArray(
                                  b.chiTietDatPhongs
                                )
                                  ? b.chiTietDatPhongs
                                      .map(
                                        (
                                          ct: any
                                        ) =>
                                          ct.tenLoaiPhong
                                      )
                                      .filter(
                                        Boolean
                                      )
                                      .join(
                                        ", "
                                      )
                                  : "";

                              const rooms =
                                Array.isArray(
                                  b.chiTietDatPhongs
                                )
                                  ? b.chiTietDatPhongs
                                      .flatMap(
                                        (
                                          ct: any
                                        ) =>
                                          Array.isArray(
                                            ct.phongs
                                          )
                                            ? ct.phongs.map(
                                                (
                                                  p: any
                                                ) =>
                                                  p.soPhong
                                              )
                                            : []
                                      )
                                      .join(
                                        ", "
                                      )
                                  : "";

                              const total =
                                computeTotalPrice(
                                  b
                                );

                              return (
                                <tr
                                  key={
                                    b.id
                                  }
                                >
                                  <td className="px-4">
                                    <Badge
                                      bg={
                                        b.trangThai ===
                                        "DA_CHECK_OUT"
                                          ? "secondary"
                                          : "primary"
                                      }
                                      className="px-3 py-2"
                                    >
                                      {
                                        b.trangThai
                                      }
                                    </Badge>
                                  </td>

                                  <td>{formatDate(b.ngayNhan)}</td>
                                  <td>{formatDate(b.ngayTra)}</td>

                                  <td>
                                    {formatDate(
                                      b.ngayTao
                                    )}
                                  </td>

                                  <td>
                                    {types ||
                                      "-"}
                                  </td>

                                  <td>
                                    {rooms ||
                                      "-"}
                                  </td>

                                  <td className="fw-semibold">
                                    {formatCurrency(
                                      total
                                    )}
                                  </td>

                                  <td>
                                    <Badge
                                      bg={getPaymentVariant(
                                        b.thanhToan
                                      )}
                                      className="px-3 py-2"
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          b.thanhToan?.toUpperCase() ===
                                          "MOMO"
                                            ? faCreditCard
                                            : faMoneyBill
                                        }
                                        className="me-2"
                                      />

                                      {b.thanhToan ||
                                        "-"}
                                    </Badge>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-2">
                                  {/* CHỜ XÁC NHẬN */}
                                  {b.trangThai === "CHO_XAC_NHAN" && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleConfirm(b.id)}
                                      disabled={confirmMutation.isPending}
                                    >
                                      <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="me-1"
                                      />

                                      {confirmMutation.isPending
                                        ? "Đang xử lý..."
                                        : "Xác nhận"}
                                    </Button>
                                  )}

                                  {/* ĐÃ XÁC NHẬN -> CHECK IN */}
                                  {b.trangThai === "DA_XAC_NHAN" && (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleCheckIn(b.id)}
                                      disabled={checkInMutation.isPending}
                                    >
                                      <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="me-1"
                                      />

                                      {checkInMutation.isPending
                                        ? "Đang xử lý..."
                                        : "Check-in"}
                                    </Button>
                                  )}

                                  {/* ĐÃ CHECK IN -> CHECK OUT */}
                                  {b.trangThai === "DA_CHECK_IN" && (
                                    <Button
                                      variant="warning"
                                      size="sm"
                                      onClick={() => handleCheckOut(b.id)}
                                      disabled={checkOutMutation.isPending}
                                    >
                                      <FontAwesomeIcon
                                        icon={faArrowLeft}
                                        className="me-1"
                                      />

                                      {checkOutMutation.isPending
                                        ? "Đang xử lý..."
                                        : "Check-out"}
                                    </Button>
                                  )}

                                  {/* ĐÃ CHECK OUT */}
                                  {b.trangThai === "DA_CHECK_OUT" && (
                                    <Badge
                                      bg="secondary"
                                      className="px-3 py-2"
                                    >
                                      Đã hoàn tất
                                    </Badge>
                                  )}
                                </div>
                                </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </Table>
                    </Card>
                  )}
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>

      {/* ============================================================= */}
      {/* ADD ROOM MODAL */}
      {/* ============================================================= */}

      <Modal
        show={showAddRoomModal}
        onHide={() =>
          setShowAddRoomModal(false)
        }
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Thêm loại phòng
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Tên loại phòng
            </Form.Label>

            <Form.Control
              value={
                newRoomType.tenLoaiPhong
              }
              placeholder="Ví dụ: Deluxe Room"
              isInvalid={Boolean(
                roomModalErrors.tenLoaiPhong
              )}
              onChange={(e) =>
                setNewRoomType(
                  (prev) => ({
                    ...prev,
                    tenLoaiPhong:
                      e.target.value,
                  })
                )
              }
            />

            <Form.Control.Feedback type="invalid">
              {
                roomModalErrors.tenLoaiPhong
              }
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Số khách tối đa
            </Form.Label>

            <Form.Control
              type="number"
              min={1}
              value={
                newRoomType.soKhachToiDa
              }
              onChange={(e) =>
                setNewRoomType(
                  (prev) => ({
                    ...prev,
                    soKhachToiDa:
                      Number(
                        e.target.value
                      ) || 1,
                  })
                )
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Kiểu giường
            </Form.Label>

            <Form.Control
              value={
                newRoomType.kieuGiuong
              }
              placeholder="Ví dụ: 1 giường đôi"
              onChange={(e) =>
                setNewRoomType(
                  (prev) => ({
                    ...prev,
                    kieuGiuong:
                      e.target.value,
                  })
                )
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-semibold">
              Mô tả
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              value={
                newRoomType.moTa
              }
              onChange={(e) =>
                setNewRoomType(
                  (prev) => ({
                    ...prev,
                    moTa:
                      e.target.value,
                  })
                )
              }
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            onClick={() =>
              setShowAddRoomModal(false)
            }
          >
            Hủy
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              if (
                !newRoomType.tenLoaiPhong?.trim()
              ) {
                setRoomModalErrors({
                  tenLoaiPhong:
                    "Nhập tên loại phòng",
                });

                return;
              }

              setRoomTypes((prev) => [
                ...prev,
                newRoomType,
              ]);

              setNewRoomType({
                tenLoaiPhong: "",
                soKhachToiDa: 1,
                kieuGiuong: "",
                moTa: "",
              });

              setRoomModalErrors({});
              setShowAddRoomModal(false);
            }}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="me-2"
            />

            Thêm loại phòng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ============================================================= */}
      {/* ADD AMENITY MODAL */}
      {/* ============================================================= */}

      <Modal
        show={showAddAmenityModal}
        onHide={() =>
          setShowAddAmenityModal(false)
        }
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Thêm tiện ích
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">
              Tên tiện ích
            </Form.Label>

            <Form.Control
              value={newAmenityLabel}
              placeholder="Ví dụ: Hồ bơi, Wifi miễn phí..."
              autoFocus
              onChange={(e) =>
                setNewAmenityLabel(
                  e.target.value
                )
              }
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            onClick={() =>
              setShowAddAmenityModal(
                false
              )
            }
          >
            Hủy
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              if (
                !newAmenityLabel.trim()
              ) {
                return;
              }

              setAmenities((prev) => [
                ...prev,
                {
                  tenTienIch:
                    newAmenityLabel.trim(),
                },
              ]);

              setNewAmenityLabel("");

              setShowAddAmenityModal(
                false
              );
            }}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="me-2"
            />

            Thêm tiện ích
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

interface SummaryCardProps {
  icon: any;
  title: string;
  value: React.ReactNode;
  subtitle: string;
}

const SummaryCard: React.FC<
  SummaryCardProps
> = ({
  icon,
  title,
  value,
  subtitle,
}) => {
  return (
    <Card
      className="border-0 shadow-sm h-100"
      style={{
        borderRadius: 16,
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex
            align-items-center justify-content-center"
            style={{
              width: 48,
              height: 48,
              background: "#eef4ff",
              color: "#0d6efd",
            }}
          >
            <FontAwesomeIcon
              icon={icon}
            />
          </div>

          <div
            className="overflow-hidden"
            style={{
              minWidth: 0,
            }}
          >
            <div className="text-secondary small mb-1">
              {title}
            </div>

            <div
              className="fw-bold text-truncate"
              style={{
                fontSize: 20,
              }}
            >
              {value}
            </div>

            <div
              className="text-secondary text-truncate"
              style={{
                fontSize: 12,
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

/*
|--------------------------------------------------------------------------
| SECTION TITLE
|--------------------------------------------------------------------------
*/

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

const SectionTitle: React.FC<
  SectionTitleProps
> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="mb-3">
      <h5 className="fw-bold mb-1">
        {title}
      </h5>

      {subtitle && (
        <div className="text-secondary small">
          {subtitle}
        </div>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

interface EmptyStateProps {
  icon: any;
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
}

const EmptyState: React.FC<
  EmptyStateProps
> = ({
  icon,
  title,
  description,
  buttonText,
  onClick,
}) => {
  return (
    <Card
      className="border-0"
      style={{
        background: "#f8f9fc",
        borderRadius: 16,
      }}
    >
      <Card.Body
        className="text-center py-5"
      >
        <div
          className="rounded-circle mx-auto mb-3
          d-flex align-items-center justify-content-center"
          style={{
            width: 64,
            height: 64,
            background: "#e9f1ff",
          }}
        >
          <FontAwesomeIcon
            icon={icon}
            size="lg"
            className="text-primary"
          />
        </div>

        <h5 className="fw-bold">
          {title}
        </h5>

        <p className="text-secondary mb-3">
          {description}
        </p>

        {buttonText && onClick && (
          <Button
            variant="primary"
            onClick={onClick}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="me-2"
            />

            {buttonText}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default OwnerHotelDetail;