import { Link } from "react-router-dom";
import "../../../../styles/components/customer/home/CustomerHeader.css";
import { getUser } from "../../../../utils/auth/auth";
import AccountMenu from "../../../common/AccountMenu";

const CustomerHeader = () => {
  const user = getUser();
  const profile = user;

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
            <AccountMenu mode="customer" name={profile?.fullName} avatar={profile?.avatar} />
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
