import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../api/auth/auth.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChevronDown, faHotel, faMoneyBillTransfer, faWallet } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/common/navigation/Sidebar";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import "./OwnerLayout.css";

interface Profile {
  fullName: string;
  permissions: string[];
  avatar: string;
}

const menuItems = [
  {
    key: "hotels",
    label: "Khách sạn",
    path: "/owner/hotels",
    icon: <FontAwesomeIcon icon={faHotel} />,
  },
  {
    key: "hoahong",
    label: "Hoa hồng",
    path: "/owner/hoahong",
    icon: <FontAwesomeIcon icon={faMoneyBillTransfer} />,
  }
];

const OwnerLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  const { data: profile } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Quản lý khách sạn</div>
            <Dropdown align="end">
            <Dropdown.Toggle
              as="div"
              id="dropdown-owner-user"
              className="avatar-dropdown"
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.fullName || "Avatar"}
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {profile?.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

    <span className="avatar-chevron">
      <FontAwesomeIcon icon={faChevronDown} />
    </span>
  </Dropdown.Toggle>

  <Dropdown.Menu>
    <Dropdown.Item
      onClick={() => {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }}
    >
      Đăng xuất
    </Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
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
