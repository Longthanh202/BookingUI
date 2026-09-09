import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faStar } from "@fortawesome/free-solid-svg-icons";

import { HotelFilterParams } from "../../../../types/khachsan/KhachSan.types";
import "./HotelCard.css";

interface HotelCardProps {
  room: {
    id: string;
    tenKhachSan: string;
    diaChi: string;
    soSao: number;
    url?: string;
    urls?: string[];
    thanhPho?: string;
  };
  filter: HotelFilterParams;
}

const HotelCard = ({ room, filter }: HotelCardProps) => {
  const [favorite, setFavorite] = useState(false);
  const navigate = useNavigate();
  const imageSrc =
    room.url ||
    room.urls?.[0] ||
    "https://via.placeholder.com/400x300?text=No+Image";

  const handleCardClick = () => {
    navigate(`/rooms/${room.id}`, { state: { filter } });
  };

  return (
    <Card className="h-100 shadow-sm hotel-card" onClick={handleCardClick}>
      <div style={{ position: "relative" }}>
        <Card.Img
          variant="top"
          src={imageSrc}
          alt={room.tenKhachSan}
          className="hotel-card__image"
          onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "https://placehold.co/400x300?text=No+Image";
          }}
        />
        <Button
          variant="light"
          size="sm"
          className="hotel-card__favorite-button"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setFavorite((prev) => !prev);
          }}
        >
          <FontAwesomeIcon icon={faHeart} style={{ color: favorite ? "#ef4444" : "#6b7280" }} />
        </Button>
      </div>

      <Card.Body className="hotel-card__body">
        <Card.Title className="hotel-card__title">
          {room.tenKhachSan}
        </Card.Title>
        <Card.Text className="hotel-card__location">
          {room.diaChi}
        </Card.Text>
        <div className="hotel-card__meta">
          <div className="hotel-card__rating">
            {Array.from({ length: room.soSao }).map((_, index) => (
              <FontAwesomeIcon key={index} icon={faStar} className="text-warning" />
            ))}
            <span className="text-muted">{room.soSao}.0</span>
          </div>
          <div className="hotel-card__price">10000đ</div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default HotelCard;
