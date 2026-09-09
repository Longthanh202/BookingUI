import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../api/auth/auth.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChevronDown, faStar, faHotel, faCreditCard, faPeopleRoof, faUser } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/common/navigation/Sidebar";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";

interface Profile {
  fullName: string;
  permissions: string[];
}

const moduleConfig: Record<string, { label: string; path: string; icon: React.ReactNode }> = {
  khachsan: { label: "Khách sạn", path: "/hotels", icon: <FontAwesomeIcon icon={faHotel} /> },
  phong: { label: "Phòng", path: "/rooms", icon: <FontAwesomeIcon icon={faPeopleRoof} /> },
  danhgia: { label: "Đánh giá", path: "/reviews", icon: <FontAwesomeIcon icon={faStar} /> },
  payment: { label: "Thanh toán", path: "/payments", icon: <FontAwesomeIcon icon={faCreditCard} /> },
  user: { label: "Người dùng", path: "/users", icon: <FontAwesomeIcon icon={faUser} /> },
};

const buildMenuFromPermissions = (permissions: string[]) => {
  const allowed = new Set(["khachsan", "phong", "danhgia", "payment", "user"]);
  const moduleSet = new Set(
    permissions
      .map((p) => p.split("_")[0])
      .filter((key) => allowed.has(key))
  );
  const order = ["khachsan", "phong", "danhgia", "payment", "user"];
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
  const navigate = useNavigate();

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
          <Dropdown align="end">
            <Dropdown.Toggle variant="secondary" id="dropdown-user">
              {profile?.fullName || "Tài khoản"} <FontAwesomeIcon icon={faChevronDown} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/profile">
                Thông tin tài khoản
              </Dropdown.Item>
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
        </header>
        <main style={{ padding: "1rem", backgroundColor: "#f3f5f7", minHeight: "100%" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
