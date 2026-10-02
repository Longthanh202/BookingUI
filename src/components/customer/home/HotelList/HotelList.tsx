import React from "react";
import { useQuery } from "@tanstack/react-query";
import HotelCard from "../HotelCard/HotelCard";
import { FilterKhachSan } from "../../../../api/home/home.api";
import { HotelFilterParams } from "../../../../types/khachsan/KhachSan.types";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import "./HotelList.css";

const HotelList = (input: HotelFilterParams) => {
  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["homeRooms", input],
    queryFn: () => FilterKhachSan(input),
    staleTime: 1000 * 60 * 5,
  });
  const rooms: any[] = Array.isArray(data)
    ? data
    : data?.data ?? data?.items ?? data?.results ?? [];

  return (
    <div className="hotel-list">
      <h3 className="hotel-list__title">Phòng nổi bật</h3>

      {isLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : isError ? (
        <p className="text-danger">Không thể tải danh sách khách sạn.</p>
      ) : (
        <Row className="row-cols-1 row-cols-md-3 row-cols-xl-4 g-4">
          {rooms.slice(0, 10).map((room) => (
            <Col key={room.id}>
              <HotelCard room={room} filter={input} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default HotelList;
