import { Link, useNavigate } from "react-router-dom";
import "./CustomerHeader.css";
import { getUser } from "../../../../utils/auth/auth";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "react-bootstrap";

const CustomerHeader = () => {
  const user = getUser();
   const navigate = useNavigate();

  const profile = user;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/customer-login");
  };

  const openBookingHistory = () => {
    navigate("/bookings");
  }

  return (
    <header className="home-header">
      <div className="home-header__inner">
        <Link to="/" className="home-header__brand">
          <div className="home-header__title">Stayro<span className="home-header__dot" /></div>
        </Link>
        <nav className="home-header__nav">
          <Link to="/">Khám phá</Link>
          <a href="/#deals">Ưu đãi</a>
          <a href="/#community">Cộng đồng</a>
        </nav>

        {user ? (
          <div className="home-header__actions">
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
                    {profile?.fullName
                      ?.trim()
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>
                )}

                <span className="avatar-chevron">
                  <FontAwesomeIcon icon={faChevronDown} />
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={openBookingHistory}>Lịch sử đặt phòng</Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>
                  Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ) : (
          <div className="home-header__actions">
            <Link className="home-header__login" to="/customer-login">Đăng nhập</Link>
            <Link className="home-header__outline" to="/register">Đăng ký</Link>
            <Link className="home-header__primary" to="/#search">Đặt phòng ngay</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default CustomerHeader;
