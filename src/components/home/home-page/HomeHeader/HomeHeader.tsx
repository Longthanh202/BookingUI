import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import "./HomeHeader.css";

const HomeHeader = () => {
  return (
    <div className="home-header">
      <div className="home-header__inner">
        <Link to="/" className="home-header__brand">
          <div className="home-header__logo">W</div>
          <div className="home-header__title">Workpro</div>
        </Link>

        <div className="home-header__actions">
          <Link to="/register">
            <Button
              variant="outline-light"
              style={{ borderRadius: 12, minWidth: 110, fontWeight: 600 }}
            >
              Đăng ký
            </Button>
          </Link>
          <Link to="/customer-login">
            <Button
              variant="light"
              style={{ borderRadius: 12, minWidth: 110, color: "#4f46e5", fontWeight: 600 }}
            >
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
