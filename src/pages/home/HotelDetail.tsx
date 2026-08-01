import React, { useEffect, useState } from "react";
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
import HomeHeader from "../../components/home/home-page/HomeHeader/HomeHeader";
import SearchTopBar from "../../components/home/home-page/SearchTopBar/SearchTopBar";
import { HotelFilterParams } from "../../types/khachsan/KhachSan.types";
import HotelRooms from "../../components/hotel/HotelRooms";


interface HotelAmenity {
  id?: string | number;
  tenTienIch?: string;
  icon?: string;
}

interface HotelDetailResponse {
  id: string;
  tenKhachSan: string;
  mota: string;
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
  const name = (amenity?.tenTienIch || "").toLowerCase();

  if (name.includes("gym")) return "💪";
  if (name.includes("thang máy") || name.includes("thang-may")) return "🛗";
  if (name.includes("đậu xe") || name.includes("dau xe")) return "🅿️";
  if (name.includes("wifi")) return "📶";
  if (name.includes("hồ bơi") || name.includes("boi")) return "🏊";
  if (name.includes("xông hơi") || name.includes("xong hoi")) return "♨️";

  return amenity?.icon || "✨";
};

const HotelDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [detailFilter, setDetailFilter] = useState<HotelFilterParams>({
    Keyword: "",
    ProvinceCode: null,
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
  const images = (data?.khachSanImages ?? [])
    .map((item) => item.url)
    .filter(Boolean) as string[];
  const amenities = (
    data?.tienIchs?.length
      ? data.tienIchs
      : defaultAmenities.map((item) => ({ tenTienIch: item, icon: "✨" }))
  ) as HotelAmenity[];

  useEffect(() => {
    if (images.length) {
      setActiveImage(images[0]);
    }
  }, [images]);

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
        ProvinceCode: null,
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
      window.alert("Đã sao chép đường dẫn khách sạn");
    } catch {
      window.alert("Không thể sao chép đường dẫn");
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
    <div>
      <HomeHeader />
      <SearchTopBar filter={detailFilter} setFilter={setDetailFilter} />
      <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 24 }}>
        <Container fluid style={{ maxWidth: 1280 }}>
          <Card className="shadow-sm rounded-4 overflow-hidden">
            <Card.Body>
              <Row className="g-4">
                <Col xs={12} lg={8}>
                  <div className="rounded-4 overflow-hidden">
                    <Image
                      src={
                        activeImage ||
                        images[0] ||
                        "https://placehold.co/900x600?text=No+Image"
                      }
                      alt={hotel.tenKhachSan}
                      fluid
                      style={{ width: "100%", height: 420, objectFit: "cover" }}
                    />
                  </div>

                  {images.length > 1 && (
                    <Row className="g-2 mt-3">
                      {images.map((src) => (
                        <Col key={src} xs={4} sm={3}>
                          <div
                            className="rounded-3 overflow-hidden"
                            style={{
                              border:
                                activeImage === src
                                  ? "2px solid #7c3aed"
                                  : "1px solid #dee2e6",
                              cursor: "pointer",
                            }}
                            onClick={() => setActiveImage(src)}
                          >
                            <Image
                              src={src}
                              alt={hotel.tenKhachSan}
                              fluid
                              style={{
                                width: "100%",
                                height: 96,
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Col>

                <Col xs={12} lg={4}>
                  <div className="d-flex flex-column justify-content-between h-100 gap-4">
                    <div>
                      <h3 className="mb-2">{hotel.tenKhachSan}</h3>
                      <div className="mb-3">
                        {Array.from({ length: hotel.soSao || 0 }).map(
                          (_, index) => (
                            <span key={index} className="text-warning me-1">
                              ★
                            </span>
                          ),
                        )}
                      </div>
                      <div className="text-secondary mb-3 d-flex align-items-center gap-2">
                        📍 {hotel.diaChi}
                      </div>
                    </div>
                    <Button variant="outline-primary" onClick={handleShare}>
                      🔗 Chia sẻ
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-4 mt-4">
            <Col xs={12} lg={8}>
              <Card className="shadow-sm rounded-4">
                <Card.Body>
                  <h5 className="mb-3">Mô tả</h5>
                  <div
                    style={{ color: "#475569", lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{
                      __html: hotel.mota || "<p>Chưa có mô tả</p>",
                    }}
                  />
                  <div className="d-flex flex-wrap gap-2">
                    {amenities.map((item) => (
                      <Badge key={item.id ?? item.tenTienIch} pill bg="primary">
                        <span className="me-1">{getAmenityIcon(item)}</span>
                        {item.tenTienIch}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row> 
          {hotel && <HotelRooms hotelId={hotel.id} />}                        
        </Container>
      </div>
    </div>
  );
};

export default HotelDetail;
