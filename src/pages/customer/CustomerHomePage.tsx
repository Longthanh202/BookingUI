import React, { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { faHeart, faMagnifyingGlass, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FilterKhachSan } from "../../api/home/home.api";
import { getUser } from "../../utils/auth/auth";
import { HotelFilterParams } from "../../types/khachsan/KhachSan.types";
import "./CustomerHomePage.css";

type HotelResult = {
  id: string;
  tenKhachSan?: string;
  diaChi?: string;
  thanhPho?: string;
  soSao?: number;
  url?: string;
  urls?: string[];
  gia?: number;
  giaMoiDem?: number;
  price?: number;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=620&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=620&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&h=620&fit=crop",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&h=620&fit=crop",
];

const destinations = [
  ["🏔️", "Đà Lạt"], ["🏖️", "Phú Quốc"], ["🏮", "Hội An"],
  ["⛰️", "Sapa"], ["🌊", "Nha Trang"], ["🏙️", "Đà Nẵng"],
  ["🌅", "Vũng Tàu"], ["🌵", "Mũi Né"],
];

const formatPrice = (hotel: HotelResult) => {
  const price = Number(hotel.giaMoiDem ?? hotel.gia ?? hotel.price ?? 0);
  return price > 0 ? `${price.toLocaleString("vi-VN")}đ` : "Liên hệ";
};

const CustomerHomePage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [filter, setFilter] = useState<HotelFilterParams>({
    Keyword: "", SoKhach: 2,
    NgayNhanPhong: null, NgayTraPhong: null, Page: 1,
  });
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [favorites, setFavorites] = useState<string[]>([]);

  const { data: hotelData, isLoading, isError } = useQuery<HotelResult[]>({
    queryKey: ["stayro-home-hotels", filter],
    queryFn: () => FilterKhachSan(filter) as Promise<HotelResult[]>,
    staleTime: 1000 * 60 * 5,
  });
  const hotels = useMemo(() => (Array.isArray(hotelData) ? hotelData : []).slice(0, 6), [hotelData]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const nextFilter: HotelFilterParams = {
      Keyword: destination,
      SoKhach: guests,
      NgayNhanPhong: checkIn || null,
      NgayTraPhong: checkOut || null,
      Page: 1,
    };
    setFilter(nextFilter);
    const params = new URLSearchParams({
      Keyword: destination,
      SoKhach: String(guests),
      NgayNhanPhong: checkIn,
      NgayTraPhong: checkOut,
    });
    navigate(`/search-results?${params.toString()}`);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="stayro-page">
      <header className="stayro-header"><div className="stayro-header__inner">
        <Link to="/" className="stayro-logo">Stayro<span /></Link>
        <nav className="stayro-nav"><a href="#stays">Khám phá</a><a href="#deals">Ưu đãi</a><a href="#community">Cộng đồng</a></nav>
        <div className="stayro-actions">{user ? <Link className="stayro-login" to="/bookings">Lịch sử đặt phòng</Link> : <Link className="stayro-login" to="/customer-login">Đăng nhập</Link>}<Link className="stayro-outline" to="/owner/hotels">Đăng chỗ ở</Link><a className="stayro-primary stayro-primary--small" href="#search">Đặt phòng ngay</a></div>
      </div></header>

      <main>
        <section className="stayro-hero"><div className="stayro-container stayro-hero__inner">
          <div className="stayro-hero__copy"><div className="stayro-eyebrow"><b>Mới</b> Hơn 12.000 chỗ ở khắp Việt Nam</div><h1>Xách vali lên<br />là có chỗ <em>chill</em></h1><p>Từ homestay lưng chừng đồi ở Đà Lạt đến villa sát biển Phú Quốc. Tìm, so sánh, đặt xong trong chưa đầy 3 phút.</p><div className="stayro-hero__buttons"><a className="stayro-primary" href="#search">Tìm chỗ ở ngay</a><a className="stayro-ghost" href="#stays">Xem chỗ ở nổi bật</a></div><div className="stayro-stats"><span><b>12.000+</b>chỗ ở đang mở</span><span><b>500K+</b>lượt đặt thành công</span><span><b>4.8</b>điểm đánh giá trung bình</span></div></div>
          <div className="stayro-collage" aria-label="Các điểm đến nổi bật"><div className="stayro-photo stayro-photo--one" /><div className="stayro-photo stayro-photo--two" /><div className="stayro-photo stayro-photo--three" /><strong>★ 4.9 · được yêu thích</strong></div>
        </div></section>

        <section className="stayro-search-wrap stayro-container" id="search"><form className="stayro-search" onSubmit={handleSearch}><div className="stayro-tabs"><b>Khách sạn</b><span>Resort</span><span>Homestay</span><span>Villa</span></div><div className="stayro-fields"><label><small>📍 Điểm đến</small><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Bạn muốn đi đâu?" /></label><label><small>📅 Nhận phòng</small><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></label><label><small>📅 Trả phòng</small><input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></label><label><small>🧑‍🤝‍🧑 Số khách</small><input type="number" min="1" max="10" value={guests} onChange={(event) => setGuests(Number(event.target.value) || 1)} /></label><button className="stayro-search-button" type="submit"><FontAwesomeIcon icon={faMagnifyingGlass} /> Tìm chỗ ở</button></div></form></section>

        <section className="stayro-container stayro-destinations"><div className="stayro-chip-row">{destinations.map(([icon, name]) => <button key={name} onClick={() => { setDestination(name); setFilter((current) => ({ ...current, Keyword: name, Page: 1 })); }}><span>{icon}</span>{name}</button>)}</div></section>

        <section className="stayro-container stayro-stays" id="stays"><div className="stayro-section-head"><div><h2>Chỗ ở đang được săn đón</h2><p>Chọn lọc từ những chuyến đi thật, được host chăm chút và khách quay lại nhiều lần.</p></div><Link to="/search-results">Xem tất cả chỗ ở</Link></div>{isLoading ? <div className="stayro-state">Đang tìm những chỗ ở phù hợp...</div> : isError ? <div className="stayro-state">Không thể tải danh sách lúc này. Bạn thử lại sau nhé.</div> : <div className="stayro-hotel-grid">{hotels.map((hotel, index) => <article className="stayro-hotel-card" key={hotel.id} onClick={() => navigate(`/rooms/${hotel.id}`, { state: { filter } })}><div className="stayro-hotel-image" style={{ backgroundImage: `url(${hotel.url || hotel.urls?.[0] || fallbackImages[index % fallbackImages.length]})` }}><span className="stayro-tag">{index < 2 ? "Bán chạy" : index === 2 ? "Mới" : "Yêu thích"}</span><button aria-label="Lưu yêu thích" onClick={(event) => { event.stopPropagation(); toggleFavorite(hotel.id); }}><FontAwesomeIcon icon={faHeart} className={favorites.includes(hotel.id) ? "is-favorite" : ""} /></button><small>📍 {hotel.thanhPho || hotel.diaChi || "Việt Nam"}</small></div><div className="stayro-hotel-body"><div className="stayro-hotel-title"><h3>{hotel.tenKhachSan || "Chỗ ở Stayro"}</h3><span><FontAwesomeIcon icon={faStar} /> {hotel.soSao || 4}.0</span></div><p>{hotel.diaChi || hotel.thanhPho || "Việt Nam"}</p><strong>{formatPrice(hotel)} <small>/ đêm</small></strong></div></article>)}</div>}</section>

        <section className="stayro-features" id="deals"><div className="stayro-container"><div className="stayro-section-head stayro-section-head--light"><div><h2>Vì sao khách quay lại đặt tiếp</h2><p>Ba điều Stayro giữ đúng lời hứa với mọi chuyến đi.</p></div></div><div className="stayro-feature-grid"><div><b>💸</b><h3>Giá hiển thị là giá cuối</h3><p>Không phụ phí ẩn khi thanh toán. Số bạn thấy lúc tìm kiếm là số bạn trả.</p></div><div><b>🔄</b><h3>Huỷ miễn phí trong 24 giờ</h3><p>Kế hoạch đổi phút chót cũng không sao, huỷ hoặc dời lịch không mất phí.</p></div><div><b>💬</b><h3>Có người trả lời lúc 2 giờ sáng</h3><p>Đội hỗ trợ trực chat 24/7, kể cả khi bạn nhận phòng trễ chuyến bay.</p></div></div></div></section>

        <section className="stayro-container stayro-testimonials" id="community"><div className="stayro-section-head"><div><h2>Người thật, chuyến đi thật</h2><p>Vài dòng từ những khách vừa check-out tuần này.</p></div></div><div className="stayro-quotes"><blockquote><p>“Đặt lúc 11 giờ đêm, 8 giờ sáng hôm sau đã có phòng ở ngay Đà Lạt. Không nghĩ là nhanh vậy.”</p><footer>TM <span>Thảo My<br />Chuyến cuối tuần ở Đà Lạt</span></footer></blockquote><blockquote><p>“Huỷ phòng vì đổi lịch bay, xong trong 30 giây, không mất đồng nào. Quá dễ chịu.”</p><footer>HK <span>Hoàng Khang<br />Công tác Đà Nẵng</span></footer></blockquote><blockquote><p>“Villa đúng như ảnh, host trả lời tin nhắn trong 5 phút. Cả nhóm 6 người đều mê.”</p><footer>NL <span>Ngọc Linh<br />Đi nhóm ở Hội An</span></footer></blockquote></div></section>

        <section className="stayro-cta"><h2>Chuyến đi tiếp theo đang chờ bạn</h2><p>Hàng ngàn chỗ ở mới được thêm mỗi tuần. Tìm chỗ, đọc đánh giá, đặt ngay.</p><a className="stayro-dark-button" href="#search">Khám phá chỗ ở</a></section>
      </main>
      <footer className="stayro-footer"><div className="stayro-container"><div className="stayro-footer__top"><div><Link to="/" className="stayro-logo stayro-logo--light">Stayro<span /></Link><p>Nền tảng đặt chỗ ở cho những người thích đi vào phút chót.</p></div><div><b>Về Stayro</b><a href="#community">Giới thiệu</a><a href="#deals">Ưu đãi</a></div><div><b>Hỗ trợ</b><a href="#search">Trung tâm trợ giúp</a><a href="#search">Liên hệ</a></div><div><b>Đối tác</b><Link to="/owner/hotels">Đăng chỗ ở của bạn</Link><a href="#deals">Đối tác doanh nghiệp</a></div></div><div className="stayro-footer__bottom">© 2026 Stayro. Mọi chuyến đi đều đáng có chỗ ở tốt.<span>Điều khoản · Bảo mật</span></div></div></footer>
    </div>
  );
};

export default CustomerHomePage;
