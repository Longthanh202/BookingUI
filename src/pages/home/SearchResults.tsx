import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomeHeader from "../../components/home/home-page/HomeHeader/HomeHeader";
import SearchTopBar from "../../components/home/home-page/SearchTopBar/SearchTopBar";
import HotelList from "../../components/home/home-page/HotelList/HotelList";
import TopHotels from "../../components/home/home-page/TopHotels/TopHotels";
import Footer from "../../components/footer/Footer";
import { HotelFilterParams } from "../../types/khachsan/KhachSan.types";

const parseFilterFromSearch = (search: string): HotelFilterParams => {
  const params = new URLSearchParams(search);
  return {
    Keyword: params.get("Keyword") || "",
    ProvinceCode: params.get("ProvinceCode") || null,
    SoKhach: params.get("SoKhach") ? Number(params.get("SoKhach")) : 2,
    NgayNhanPhong: params.get("NgayNhanPhong") || null,
    NgayTraPhong: params.get("NgayTraPhong") || null,
    Page: 1,
  };
};

const SearchResults = () => {
  const location = useLocation();
  const [filter, setFilter] = useState<HotelFilterParams>({
    Keyword: "",
    ProvinceCode: null,
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
      <HomeHeader />
      <SearchTopBar filter={filter} setFilter={setFilter} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 28 }}>Kết quả tìm kiếm</h2>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Điều chỉnh bộ lọc trên thanh cố định để tìm phòng phù hợp nhanh hơn.
          </p>
        </div>

        <HotelList {...filter} />
        <TopHotels />
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
