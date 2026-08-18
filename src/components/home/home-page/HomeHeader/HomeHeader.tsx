import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import "./HomeHeader.css";
import { getUser } from "../../../../utils/auth/auth";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "react-bootstrap";

const HomeHeader = () => {
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
    <div className="home-header">
      <div className="home-header__inner">

        {/* Logo */}
        <Link to="/" className="home-header__brand">
          <div className="home-header__logo">W</div>
          <div className="home-header__title">Workpro</div>
        </Link>

        {/* ========================= */}
        {/* ĐÃ ĐĂNG NHẬP */}
        {/* ========================= */}

        {user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >                      
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
                <Dropdown.Item onClick={openBookingHistory}>
                  Booking History
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>
                  Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ) : (

          /* ========================= */
          /* CHƯA ĐĂNG NHẬP */
          /* ========================= */

          <div className="home-header__actions">

            <Link to="/register">
              <Button
                variant="outline-light"
                style={{
                  borderRadius: 12,
                  minWidth: 110,
                  fontWeight: 600,
                }}
              >
                Đăng ký
              </Button>
            </Link>

            <Link to="/customer-login">
              <Button
                variant="light"
                style={{
                  borderRadius: 12,
                  minWidth: 110,
                  color: "#4f46e5",
                  fontWeight: 600,
                }}
              >
                Đăng nhập
              </Button>
            </Link>

          </div>
        )}
      </div>
    </div>
  );
};

export default HomeHeader;
