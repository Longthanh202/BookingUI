import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../api/auth/auth.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faStar, faHotel, faCreditCard, faPeopleRoof, faUser, faClipboardList, faWallet, faBullhorn, faImage } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/common/navigation/Sidebar";
import Button from "react-bootstrap/Button";
import AccountMenu from "../components/common/AccountMenu";

interface Profile {
  fullName: string;
  permissions: string[];
}

const moduleConfig: Record<string, { label: string; path: string; icon: React.ReactNode }> = {
  khachsan: { label: "Khách sạn", path: "/admin/hotels", icon: <FontAwesomeIcon icon={faHotel} /> },
  phong: { label: "Phòng", path: "/admin/rooms", icon: <FontAwesomeIcon icon={faPeopleRoof} /> },
  danhgia: { label: "Đánh giá", path: "/admin/reviews", icon: <FontAwesomeIcon icon={faStar} /> },
  payment: { label: "Thanh toán", path: "/admin/payments", icon: <FontAwesomeIcon icon={faCreditCard} /> },
  user: { label: "Người dùng", path: "/admin/users", icon: <FontAwesomeIcon icon={faUser} /> },
  booking: { label: "Booking", path: "/admin/bookings", icon: <FontAwesomeIcon icon={faClipboardList} /> },
  commission: { label: "Hoa hồng", path: "/admin/commissions", icon: <FontAwesomeIcon icon={faWallet} /> },
  finance: { label: "Rút tiền", path: "/admin/withdrawals", icon: <FontAwesomeIcon icon={faWallet} /> },
  advertising: { label: "Quảng cáo", path: "/admin/advertising", icon: <FontAwesomeIcon icon={faBullhorn} /> },
  banner: { label: "Banner", path: "/admin/banners", icon: <FontAwesomeIcon icon={faImage} /> },
};

const buildMenuFromPermissions = (permissions: string[]) => {
  const allowed = new Set(["khachsan", "phong", "danhgia", "payment", "user", "booking", "commission", "finance", "advertising", "banner"]);
  const moduleSet = new Set(
    permissions
      .map((p) => p.split("_")[0])
      .filter((key) => allowed.has(key))
  );
  const order = ["khachsan", "booking", "payment", "commission", "finance", "advertising", "banner", "phong", "danhgia", "user"];
  const orderedModules = order.filter((key) => moduleSet.has(key));

  return orderedModules.map((module) => ({
    key: module,
    icon: moduleConfig[module]?.icon || null,
    label: moduleConfig[module]?.label || module,
    path: moduleConfig[module]?.path || "/",
  }));
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const menuItems = profile?.permissions ? buildMenuFromPermissions(profile.permissions) : [];

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
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
          <AccountMenu mode="admin" name={profile?.fullName} />
        </header>
        <main style={{ padding: "1rem", backgroundColor: "#f3f5f7", minHeight: "100%" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
