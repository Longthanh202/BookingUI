import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { getHotelDetailById } from "../../api/khachsan/khachsan.api";
import CustomerHeader from "../../components/customer/home/CustomerHeader/CustomerHeader";
import { showToast } from "../../components/common/Toast";
import { HotelFilterParams } from "../../types/khachsan/KhachSan.types";
import { HotelRoomSelector } from "../../components/hotel/HotelRoomSelector";
import "../../styles/customer/HotelDetailPage.css";

interface HotelAmenity {
  id?: string | number;
  tenTienIch?: string;
  icon?: string;
}

interface HotelDetailResponse {
  id: string;
  tenKhachSan: string;
  moTa: string;
  diaChi: string;
  thanhPho?: string | null;
  soSao: number;
  gioNhanPhong: string;
  gioTraPhong: string;
  trangThai?: string | null;
  urls?: string[] | null;

  khachSanImages?: Array<{ id: number; url: string }>;
  tienIchs?: HotelAmenity[];
}

const defaultAmenities = ["Wi-Fi miễn phí", "Hồ bơi", "Phòng xông hơi", "Gym"];

const getAmenityIcon = (amenity?: HotelAmenity) => {
  // Nếu có icon (chuỗi HTML thẻ <i class="...">) trả về icon đó
  if (amenity?.icon && amenity.icon.trim() !== "") {
    return amenity.icon;
  }
  // Fallback nếu không có icon trong DB
  return '<i class="fa-solid fa-star"></i>';
};

const HotelDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const thumbnailRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [detailFilter, setDetailFilter] = useState<HotelFilterParams>({
    Keyword: "",
    SoKhach: 2,
    NgayNhanPhong: null,
    NgayTraPhong: null,
    Page: 1,
  });

  const { data, isLoading, isError } = useQuery<HotelDetailResponse>({
    queryKey: ["hotelDetail", id],
    queryFn: () => getHotelDetailById(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  });

  const hotel = data;
  const images = useMemo(() => {
    const imageUrls = data?.khachSanImages?.map((item) => item.url) ?? data?.urls ?? [];
    return imageUrls.filter(Boolean) as string[];
  }, [data?.khachSanImages, data?.urls]);
  const imageCount = images.length;
  const imageToShow =
    images[activeImageIndex] ||
    images[0] ||
    "https://placehold.co/900x600?text=No+Image";
  const amenities = (
    data?.tienIchs?.length
      ? data.tienIchs
      : defaultAmenities.map((item) => ({ tenTienIch: item, icon: "✨" }))
  ) as HotelAmenity[];

  useEffect(() => {
    if (imageCount) {
      setActiveImageIndex(0);
    }
  }, [imageCount]);

  useEffect(() => {
    if (activeImageIndex >= imageCount) {
      setActiveImageIndex(0);
    }
  }, [imageCount, activeImageIndex]);

  useEffect(() => {
    setImageLoaded(false);
  }, [activeImageIndex]);

  useEffect(() => {
    if (!images.length) return;

    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % images.length);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [images]);

  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [imageToShow]);

  const thumbnailContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = thumbnailContainerRef.current;
    const thumbnail = thumbnailRefs.current[activeImageIndex];

    if (!container || !thumbnail) return;

    const containerRect = container.getBoundingClientRect();
    const thumbnailRect = thumbnail.getBoundingClientRect();

    const isLeft = thumbnailRect.left < containerRect.left;

    const isRight = thumbnailRect.right > containerRect.right;

    if (isLeft) {
      container.scrollTo({
        left: container.scrollLeft - (containerRect.left - thumbnailRect.left),
        behavior: "smooth",
      });
    } else if (isRight) {
      container.scrollTo({
        left:
          container.scrollLeft + (thumbnailRect.right - containerRect.right),
        behavior: "smooth",
      });
    }
  }, [activeImageIndex, imageCount]);

  useEffect(() => {
    if (location.state?.filter) {
      const filter = location.state.filter as HotelFilterParams;
      setDetailFilter(filter);
      setCheckInDate(filter.NgayNhanPhong || "");
      setCheckOutDate(filter.NgayTraPhong || "");
      setGuestsCount(filter.SoKhach || 2);
    } else {
      setDetailFilter({
        Keyword: "",
        SoKhach: 2,
        NgayNhanPhong: null,
        NgayTraPhong: null,
        Page: 1,
      });
      setGuestsCount(2);
      setCheckInDate("");
      setCheckOutDate("");
    }
    setSelectedRoomId("");
    setRoomsCount(1);
  }, [id, location.state]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép đường dẫn khách sạn", "success");
    } catch {
      showToast("Không thể sao chép đường dẫn", "error");
    }
  };

  const canBook = Boolean(
    checkInDate && checkOutDate && selectedRoomId && roomsCount > 0,
  );

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h4>Không tìm thấy khách sạn</h4>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const mapUrl = hotel.diaChi
    ? `https://maps.google.com/maps?q=${encodeURIComponent(hotel.diaChi)}&output=embed`
    : "";

  return (
    <div className="stayro-detail">
      <CustomerHeader />
      <div className="stayro-detail__surface">
        <Container fluid style={{ maxWidth: 1280 }}>
          <div className="stayro-detail__breadcrumb">
            Stayro <span>/</span> Khám phá <span>/</span> {hotel.tenKhachSan}
          </div>
          <Card className="stayro-detail__hero shadow-sm rounded-4 overflow-hidden">
            <Card.Body>
              <Row className="g-4">
                <Col xs={12} lg={8}>
                  <div
                    className="rounded-4 overflow-hidden position-relative d-flex justify-content-center align-items-center"
                    style={{ background: "#f3f4f6", minHeight: 420 }}
                  >
                    <img
                      ref={imageRef}
                      key={imageToShow}
                      src={imageToShow}
                      alt={hotel.tenKhachSan}
                      style={{
                        width: "100%",
                        maxWidth: 1200,
                        height: "auto",
                        maxHeight: 420,
                        objectFit: "contain",
                        display: "block",
                        opacity: imageLoaded ? 1 : 0,
                        transition: "opacity 0.4s ease-in-out",
                        background: "#f3f4f6",
                      }}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(true)}
                    />

                    {imageCount > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveImageIndex(
                              (current) =>
                                (current - 1 + imageCount) % imageCount,
                            );
                            setImageLoaded(false);
                          }}
                          style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            border: "none",
                            background: "rgba(0,0,0,0.45)",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveImageIndex(
                              (current) => (current + 1) % imageCount,
                            );
                            setImageLoaded(false);
                          }}
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            border: "none",
                            background: "rgba(0,0,0,0.45)",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          ›
                        </button>
                        <div
                          style={{
                            position: "absolute",
                            left: "50%",
                            bottom: 12,
                            transform: "translateX(-50%)",
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                            fontSize: 14,
                          }}
                        >
                          {activeImageIndex + 1}/{imageCount}
                        </div>
                      </>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div
                      ref={thumbnailContainerRef}
                      style={{
                        display: "flex",
                        gap: 12,
                        overflowX: "auto",
                        paddingTop: 16,
                        paddingBottom: 6,
                        paddingLeft: 4,
                        paddingRight: 4,
                      }}
                    >
                      {images.map((src, index) => (
                        <div
                          key={src}
                          ref={(el) => (thumbnailRefs.current[index] = el)}
                          className="rounded-3 overflow-hidden"
                          style={{
                            width: 120,
                            height: 96,
                            flex: "0 0 auto",
                            border:
                              activeImageIndex === index
                                ? "2px solid #7c3aed"
                                : "1px solid #dee2e6",
                            cursor: "pointer",
                            transform:
                              activeImageIndex === index
                                ? "scale(1.03)"
                                : "scale(1)",
                            transition:
                              "transform 0.25s ease, border-color 0.25s ease",
                          }}
                          onClick={() => {
                            if (index === activeImageIndex) {
                              return;
                            }
                            setActiveImageIndex(index);
                            setImageLoaded(false);
                          }}
                        >
                          <Image
                            src={src}
                            alt={`${hotel.tenKhachSan} ${index + 1}`}
                            fluid
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Col>

                <Col xs={12} lg={4}>
                  <div className="d-flex flex-column justify-content-between h-100 gap-4">
                    <div>
                      <div className="stayro-detail__eyebrow">
                        STAYRO VERIFIED
                      </div>
                      <h1 className="stayro-detail__title">
                        {hotel.tenKhachSan}
                      </h1>
                      <div className="stayro-detail__rating mb-3">
                        {Array.from({ length: hotel.soSao || 0 }).map(
                          (_, index) => (
                            <span key={index} className="text-warning me-1">
                              ★
                            </span>
                          ),
                        )}
                      </div>
                      <div className="stayro-detail__address mb-3 d-flex align-items-center gap-2">
                        📍 {hotel.diaChi}
                      </div>
                      <div className="stayro-detail__facts">
                        <span>
                          <b>Nhận phòng</b>
                          {hotel.gioNhanPhong || "14:00"}
                        </span>
                        <span>
                          <b>Trả phòng</b>
                          {hotel.gioTraPhong || "12:00"}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="stayro-share-button"
                      onClick={handleShare}
                    >
                      ↗ Chia sẻ chỗ ở
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-4 mt-4">
            <Col xs={12} lg={8}>
              <Card className="stayro-detail__description shadow-sm rounded-4">
                <Card.Body>
                  <h2 className="stayro-detail__section-title mb-3">
                    Về chỗ ở này
                  </h2>
                  <div
                    style={{ color: "#475569", lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{
                      __html: hotel.moTa || "<p>Chưa có mô tả</p>",
                    }}
                  />
                  <div className="stayro-amenities d-flex flex-wrap gap-2">
                    {amenities.map((item) => (
                      <Badge key={item.id ?? item.tenTienIch} pill bg="primary">
                        <span
                          className="me-1"
                          dangerouslySetInnerHTML={{
                            __html: getAmenityIcon(item),
                          }}
                        />
                        {item.tenTienIch}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {hotel && (
            <HotelRoomSelector
              hotelId={hotel.id}
              hotelName={hotel.tenKhachSan}
              hotelAddress={hotel.diaChi}
              hotelImage={images[0]}
              checkInTime={hotel.gioNhanPhong}
              checkOutTime={hotel.gioTraPhong}
              initialCheckIn={detailFilter.NgayNhanPhong}
              initialCheckOut={detailFilter.NgayTraPhong}
              initialGuests={detailFilter.SoKhach ?? 1}
            />
          )}
        </Container>
      </div>
    </div>
  );
};

export default HotelDetailPage;
