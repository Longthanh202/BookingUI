import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfileApi, UserProfile } from "../api/auth/auth.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell, faCalendarDays, faChartLine, faClipboardList, faBed, faHotel, faMoneyBillTransfer, faPeopleGroup, faPercent, faStar, faUsers, faWallet, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/common/navigation/Sidebar";
import Button from "react-bootstrap/Button";
import "../styles/layouts/OwnerLayout.css";
import "../styles/layouts/OwnerFormControls.css";
import AccountMenu from "../components/common/AccountMenu";

const menuItems = [
  { key: "dashboard", label: "Tổng quan", path: "/owner/dashboard", icon: <FontAwesomeIcon icon={faChartLine} /> },
  {
    key: "hotels",
    label: "Property của tôi",
    path: "/owner/hotels",
    icon: <FontAwesomeIcon icon={faHotel} />,
  },
  { key: "bookings", label: "Booking", path: "/owner/bookings", icon: <FontAwesomeIcon icon={faClipboardList} /> },
  { key: "calendar", label: "Lịch phòng", path: "/owner/calendar", icon: <FontAwesomeIcon icon={faCalendarDays} /> },
  { key: "rooms", label: "Phòng & resource", path: "/owner/rooms", icon: <FontAwesomeIcon icon={faBed} /> },
  { key: "pricing", label: "Giá & khuyến mãi", path: "/owner/pricing", icon: <FontAwesomeIcon icon={faPercent} /> },
  { key: "customers", label: "Khách hàng", path: "/owner/customers", icon: <FontAwesomeIcon icon={faUsers} /> },
  { key: "reports", label: "Báo cáo", path: "/owner/reports", icon: <FontAwesomeIcon icon={faChartLine} /> },
  { key: "reviews", label: "Review", path: "/owner/reviews", icon: <FontAwesomeIcon icon={faStar} /> },
  { key: "staff", label: "Nhân sự", path: "/owner/staff", icon: <FontAwesomeIcon icon={faPeopleGroup} /> },
  { key: "notifications", label: "Thông báo", path: "/owner/notifications", icon: <FontAwesomeIcon icon={faBell} /> },
  { key: "wallet", label: "Ví & giao dịch", path: "/owner/wallet", icon: <FontAwesomeIcon icon={faWallet} /> },
  { key: "advertising", label: "Quảng cáo", path: "/owner/advertising", icon: <FontAwesomeIcon icon={faBullhorn} /> },
  { key: "hoahong", label: "Hoa hồng", path: "/owner/hoahong", icon: <FontAwesomeIcon icon={faMoneyBillTransfer} /> },
];

const OwnerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="owner-layout" style={{ minHeight: "100vh", display: "flex" }}>
      <Sidebar collapsed={collapsed} menuItems={menuItems} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid #dee2e6",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Button variant="link" onClick={() => setCollapsed(!collapsed)}>
            <FontAwesomeIcon icon={faBars} />
          </Button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Trung tâm vận hành</div>
            <AccountMenu mode="owner" name={profile?.fullName} />
          </div>
        </header>
        <main style={{ padding: "1rem", backgroundColor: "#f3f5f7", minHeight: "100%" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
