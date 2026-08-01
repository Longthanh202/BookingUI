import React, { useState } from "react";
import HomeHeader from "../../components/home/home-page/HomeHeader/HomeHeader";
import SearchBanner from "../../components/home/home-page/SearchBanner/SearchBanner";
import HotelList from "../../components/home/home-page/HotelList/HotelList";
import PopularDestinations from "../../components/home/home-page/PopularDestinations/PopularDestinations";
import Footer from "../../components/footer/Footer";
import { HotelFilterParams } from "../../types/khachsan/KhachSan.types";

const HomePage = () => {
  const [filter, setFilter] = useState<HotelFilterParams>({
    Keyword: "",
    ProvinceCode: null,
    SoKhach: 2,
    NgayNhanPhong: null,
    NgayTraPhong: null,
    Page: 1,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <HomeHeader />
      <SearchBanner filter={filter} setFilter={setFilter} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
        <HotelList {...filter} />
        <PopularDestinations />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
