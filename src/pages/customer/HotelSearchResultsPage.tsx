import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CustomerHeader from "../../components/customer/home/CustomerHeader/CustomerHeader";
import HotelList from "../../components/customer/home/HotelList/HotelList";
import FeaturedHotelList from "../../components/customer/home/FeaturedHotelList/FeaturedHotelList";
import SiteFooter from "../../components/common/SiteFooter";
import { HotelFilterParams } from "../../types/khachsan/KhachSan.types";

const parseFilterFromSearch = (search: string): HotelFilterParams => {
  const params = new URLSearchParams(search);
  return {
    Keyword: params.get("Keyword") || "",
    SoKhach: params.get("SoKhach") ? Number(params.get("SoKhach")) : 2,
    NgayNhanPhong: params.get("NgayNhanPhong") || null,
    NgayTraPhong: params.get("NgayTraPhong") || null,
    Page: 1,
  };
};

const HotelSearchResultsPage = () => {
  const location = useLocation();
  const [filter, setFilter] = useState<HotelFilterParams>({
    Keyword: "",
    SoKhach: 2,
    NgayNhanPhong: null,
    NgayTraPhong: null,
    Page: 1,
  });

  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter);
      return;
    }

    if (location.search) {
      setFilter(parseFilterFromSearch(location.search));
    }
  }, [location.state, location.search]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <CustomerHeader />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 28 }}>Kết quả tìm kiếm</h2>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Điều chỉnh bộ lọc trên thanh cố định để tìm phòng phù hợp nhanh hơn.
          </p>
        </div>

        <HotelList {...filter} />
        <FeaturedHotelList />
      </div>
      <SiteFooter />
    </div>
  );
};

export default HotelSearchResultsPage;
