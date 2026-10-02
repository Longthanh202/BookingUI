import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { googleLoginApi, loginApi } from "../../api/auth/auth.api";
import "./CustomerLoginPage.css";

const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.redirectTo || "/";
  const returnState = (location.state as any)?.bookingData
    ? { state: (location.state as any).bookingData }
    : undefined;
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async (credential: string) => {
    try {
      const response = await googleLoginApi(credential);
      localStorage.setItem("accessToken", response.token);
      navigate(returnTo, returnState);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
    }
  };

  const handleCustomerLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await loginApi(username.trim(), password);
      localStorage.setItem("accessToken", response.token);
      navigate(returnTo, returnState);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Tên đăng nhập hoặc mật khẩu chưa đúng.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="customer-login-page">
      <section className="customer-login-shell">
        <div className="customer-login-story">
          <Link to="/" className="customer-login-logo">Stayro<span /></Link>
          <div className="customer-login-story-copy">
            <div className="customer-login-kicker"><span /> YOUR NEXT STAY</div>
            <h1>Mỗi chuyến đi,<br /><em>một nơi để nhớ.</em></h1>
            <p>Đăng nhập để tiếp tục những kế hoạch còn dang dở, theo dõi booking và nhận ưu đãi dành riêng cho bạn.</p>
          </div>
          <div className="customer-login-trip-card">
            <div className="customer-login-trip-image" />
            <div><small>Được yêu thích tuần này</small><strong>Villa bên biển · Phú Quốc</strong><span>★ 4.9 · 128 đánh giá</span></div>
          </div>
          <Link to="/" className="customer-login-back"><FontAwesomeIcon icon={faArrowLeft} /> Về trang khám phá</Link>
        </div>

        <div className="customer-login-form-panel">
          <div className="customer-login-form-heading">
            <span className="customer-login-mobile-logo">Stayro<span /></span>
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập để bắt đầu chuyến đi tiếp theo.</p>
          </div>

          <form onSubmit={handleCustomerLogin} className="customer-login-form">
            {error && <div className="customer-login-error" role="alert">{error}</div>}
            <label htmlFor="customer-username">Tên đăng nhập</label>
            <div className="customer-login-input-wrap"><FontAwesomeIcon icon={faUser} /><input id="customer-username" type="text" placeholder="Nhập tên đăng nhập" value={username} onChange={(event) => setUserName(event.target.value)} autoComplete="username" /></div>
            <div className="customer-login-password-label"><label htmlFor="customer-password">Mật khẩu</label><Link to="/forgot-password">Quên mật khẩu?</Link></div>
            <div className="customer-login-input-wrap"><FontAwesomeIcon icon={faLock} /><input id="customer-password" type="password" placeholder="Nhập mật khẩu" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></div>
            <button type="submit" className="customer-login-submit" disabled={submitting}>{submitting ? "Đang đăng nhập..." : <>Đăng nhập <FontAwesomeIcon icon={faArrowRight} /></>}</button>
          </form>

          <div className="customer-login-divider"><span>Hoặc tiếp tục với</span></div>
          <div className="customer-login-socials"><GoogleLogin onSuccess={(response) => response.credential && handleGoogleLogin(response.credential)} onError={() => setError("Đăng nhập Google thất bại. Vui lòng thử lại.")} /><button type="button" className="customer-login-social customer-login-facebook" onClick={() => setError("Đăng nhập Facebook chưa được triển khai.")}><b>f</b> Facebook</button></div>
          <p className="customer-login-register">Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link></p>
          <small className="customer-login-terms">Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Stayro.</small>
        </div>
      </section>
    </main>
  );
};

export default CustomerLoginPage;
