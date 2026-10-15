import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../api/auth/auth.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh, faHotel, faCreditCard, faUser, faClipboardList, faWallet, faBullhorn, faImage, faTags, faUserShield, faStar, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import AccountMenu from "../components/common/AccountMenu";
import "../styles/layouts/AdminLayout.css";

interface Profile {
  fullName: string;
}

const sections = [
  { title: "Tổng quan", links: [{ label: "Bàn điều hành", path: "/admin", icon: faGaugeHigh }] },
  { title: "Vận hành", links: [
    { label: "Đặt phòng", path: "/admin/bookings", icon: faClipboardList },
    { label: "Khách sạn", path: "/admin/hotels", icon: faHotel },
    { label: "Thanh toán", path: "/admin/payments", icon: faCreditCard },
    { label: "Rút tiền", path: "/admin/withdrawals", icon: faWallet },
    { label: "Hoa hồng", path: "/admin/commissions", icon: faWallet },
    { label: "Quảng cáo", path: "/admin/advertising", icon: faBullhorn },
  ] },
  { title: "Nội dung", links: [
    { label: "Banner", path: "/admin/banners", icon: faImage },
    { label: "Tags khám phá", path: "/admin/tags", icon: faTags },
    { label: "Đánh giá", path: "/admin/reviews", icon: faStar },
  ] },
  { title: "Truy cập", links: [
    { label: "Người dùng", path: "/admin/users", icon: faUser },
    { label: "Phân quyền", path: "/admin/permissions", icon: faUserShield },
  ] },
];

const pageTitles: Record<string, string> = {
  admin: "Bàn điều hành", bookings: "Đặt phòng", hotels: "Khách sạn", payments: "Thanh toán",
  withdrawals: "Yêu cầu rút tiền", commissions: "Hoa hồng", advertising: "Quảng cáo",
  banners: "Banner", tags: "Tags khám phá", reviews: "Đánh giá", users: "Người dùng", permissions: "Phân quyền",
};

const AdminLayout = () => {
  const location = useLocation();
  const currentSection = location.pathname.split("/").filter(Boolean).at(-1) || "admin";

  const { data: profile } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin" className="admin-brand" aria-label="Stayro Admin home">
          <span className="admin-brand-mark">S</span>
          <span className="admin-brand-copy"><strong>stayro</strong><small>ADMIN CONSOLE</small></span>
        </NavLink>
        <nav className="admin-navigation" aria-label="Điều hướng quản trị">
          {sections.map((section) => <div className="admin-nav-section" key={section.title}>
            <div className="admin-nav-heading">{section.title}</div>
            {section.links.map((link) => <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/admin"}
              className={({ isActive }) => `admin-nav-link${isActive ? " is-active" : ""}`}
            >
              <FontAwesomeIcon icon={link.icon} fixedWidth />
              <span>{link.label}</span>
            </NavLink>)}
          </div>)}
        </nav>
        <div className="admin-sidebar-foot">
          <span className="admin-status-dot" />
          <span>Hệ thống quản trị</span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <span className="admin-eyebrow">STAYRO / QUẢN TRỊ</span>
            <h1>{pageTitles[currentSection] || "Quản trị"}</h1>
          </div>
          <AccountMenu mode="admin" name={profile?.fullName} />
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
