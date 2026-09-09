import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FeaturedHotelList.css";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faStar } from "@fortawesome/free-solid-svg-icons";

const mockTopHotels = [
  {
    id: "top-1",
    tenKhachSan: "Khách Sạn Hạng Sang Hồ Chí Minh",
    diaChi: "1A Nguyễn Huệ, Quận 1, TP.HCM",
    soSao: 5,
    url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
    thanhPho: "Hồ Chí Minh",
    luotThue: 2500,
    gia: 250000,
  },
  {
    id: "top-2",
    tenKhachSan: "Khách Sạn Mặt Phố Hà Nội",
    diaChi: "52 Hàng Bông, Hoàn Kiếm, Hà Nội",
    soSao: 5,
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
    thanhPho: "Hà Nội",
    luotThue: 2200,
    gia: 280000,
  },
  {
    id: "top-3",
    tenKhachSan: "Resort Biển Đà Nẵng",
    diaChi: "Bãi Bắc, Sơn Trà, Đà Nẵng",
    soSao: 5,
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    thanhPho: "Đà Nẵng",
    luotThue: 1800,
    gia: 220000,
  },
];

interface TopHotelCardProps {
  hotel: (typeof mockTopHotels)[0];
}

const TopHotelCard = ({ hotel }: TopHotelCardProps) => {
  const [favorite, setFavorite] = useState(false);
  const imageSrc = hotel.url || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <Link to={`/rooms/${hotel.id}`} className="text-decoration-none text-dark">
      <Card className="h-100 shadow-sm" style={{ borderRadius: 20, overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <Card.Img
            variant="top"
            src={imageSrc}
            alt={hotel.tenKhachSan}
            style={{ height: 200, objectFit: "cover" }}
            onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "https://placehold.co/400x300?text=No+Image";
            }}
          />
          <Button
            variant="light"
            size="sm"
            style={{
              position: "absolute",
              right: 16,
              top: 16,
              borderRadius: 12,
              width: 40,
              height: 40,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              setFavorite((prev) => !prev);
            }}
          >
            <FontAwesomeIcon icon={faHeart} style={{ color: favorite ? "#ef4444" : "#6b7280" }} />
          </Button>
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              background: "#f59e0b",
              color: "white",
              padding: "4px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            ⭐ Được thuê nhiều
          </div>
        </div>

        <Card.Body>
          <Card.Title style={{ fontSize: 18, marginBottom: 10 }}>{hotel.tenKhachSan}</Card.Title>
          <Card.Text className="text-muted" style={{ fontSize: 12 }}>
            {hotel.diaChi}
          </Card.Text>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="d-flex align-items-center gap-2">
              {Array.from({ length: hotel.soSao }).map((_, index) => (
                <FontAwesomeIcon key={index} icon={faStar} className="text-warning" style={{ fontSize: 12 }} />
              ))}
              <span className="text-muted" style={{ fontSize: 12 }}>
                {hotel.soSao}.0
              </span>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="fw-bold text-primary" style={{ fontSize: 16 }}>
              {hotel.gia.toLocaleString()}₫
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              {hotel.luotThue} lượt thuê
            </div>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

const FeaturedHotelList = () => {
  return (
    <div style={{ marginTop: 48, marginBottom: 48 }}>
      <h3 className="mb-4">🏆 Khách sạn được thuê nhiều nhất</h3>
      <Row className="g-4">
        {mockTopHotels.map((hotel) => (
          <Col key={hotel.id} xs={12} md={6} lg={4}>
            <TopHotelCard hotel={hotel} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FeaturedHotelList;
