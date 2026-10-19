import React, { useEffect, useState } from "react";
import { useHotelList } from "../../../../hooks/useCustomerQueries";
import HotelCard from "../HotelCard/HotelCard";
import { HotelFilterParams } from "../../../../types/khachsan/KhachSan.types";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import NumberedPagination from "../../../common/NumberedPagination";
import "../../../../styles/components/customer/home/HotelList.css";

const HotelList = (input: HotelFilterParams) => {
  const [page, setPage] = useState(input.Page || 1);
  const pageSize = input.PageSize || 10;
  const queryFilter = { ...input, Page: page, PageSize: pageSize };
  const { data, isLoading, isError } = useHotelList(queryFilter);
  const rooms: any[] = Array.isArray(data)
    ? data
    : data?.data ?? data?.items ?? data?.results ?? [];
  const totalPages = Math.max(1, Number(data?.totalPage ?? data?.data?.totalPage ?? (data?.totalRow || data?.totalCount
    ? Math.ceil(Number(data.totalRow ?? data.totalCount) / pageSize)
    : rooms.length >= pageSize ? page + 1 : page)));

  useEffect(() => {
    setPage(1);
  }, [input.Keyword, input.SoKhach, input.NgayNhanPhong, input.NgayTraPhong]);

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
          {rooms.map((room) => (
            <Col key={room.id}>
              <HotelCard room={room} filter={queryFilter} />
            </Col>
          ))}
        </Row>
      )}
      {!isLoading && !isError && (
        <NumberedPagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-3" />
      )}
    </div>
  );
};

export default HotelList;
