import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCheck, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { forgotPassword } from "../../api/auth/auth.api";
import "./CustomerLoginPage.css";

const CustomerRecoveryPage = () => {
  const [params] = useSearchParams();
  const isReset = Boolean(params.get("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (isReset && password !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }
    try {
      if (!isReset) await forgotPassword(username.trim());
      setSent(true);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Không thể gửi yêu cầu lúc này. Vui lòng thử lại.");
    }
  };

  return (
    <main className="customer-login-page">
      <section className="customer-login-shell">
        <div className="customer-login-story">
          <Link to="/" className="customer-login-logo">Stayro<span /></Link>
          <div className="customer-login-story-copy">
            <div className="customer-login-kicker"><span /> STAYRO ACCOUNT</div>
            <h1>Đi xa hơn,<br /><em>an tâm hơn.</em></h1>
            <p>Khôi phục tài khoản để tiếp tục quản lý booking và những chuyến đi yêu thích của bạn.</p>
          </div>
          <div className="customer-password-points"><div><FontAwesomeIcon icon={faCheck} /><span>Khôi phục tài khoản nhanh chóng</span></div><div><FontAwesomeIcon icon={faCheck} /><span>Bảo mật thông tin cá nhân</span></div></div>
          <Link to="/customer-login" className="customer-login-back"><FontAwesomeIcon icon={faArrowLeft} /> Quay lại đăng nhập</Link>
        </div>
        <div className="customer-login-form-panel">
          <Link to="/" className="customer-login-mobile-logo">Stayro<span /></Link>
          <div className="customer-password-icon"><FontAwesomeIcon icon={isReset ? faLock : faEnvelope} /></div>
          <div className="customer-login-form-heading"><h2>{isReset ? "Đặt mật khẩu mới" : "Quên mật khẩu?"}</h2><p>{isReset ? "Tạo mật khẩu mới để bảo vệ tài khoản của bạn." : "Nhập username để nhận hướng dẫn khôi phục tài khoản."}</p></div>
          {sent ? <div className="customer-password-success"><span><FontAwesomeIcon icon={faCheck} /></span><h3>{isReset ? "Mật khẩu đã được cập nhật" : "Kiểm tra hộp thư của bạn"}</h3><p>{isReset ? "Bạn có thể dùng mật khẩu mới để đăng nhập vào Stayro." : "Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn."}</p><Link to="/customer-login" className="customer-login-submit">Đăng nhập ngay <FontAwesomeIcon icon={faArrowRight} /></Link></div> : <form onSubmit={submit} className="customer-login-form">{error && <div className="customer-login-error" role="alert">{error}</div>}{isReset ? <><label htmlFor="recovery-password">Mật khẩu mới</label><div className="customer-login-input-wrap"><FontAwesomeIcon icon={faLock} /><input id="recovery-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tối thiểu 8 ký tự" minLength={8} required /></div><label htmlFor="recovery-confirm-password">Nhập lại mật khẩu</label><div className="customer-login-input-wrap"><FontAwesomeIcon icon={faLock} /><input id="recovery-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu mới" required /></div></> : <><label htmlFor="recovery-username">Tên đăng nhập</label><div className="customer-login-input-wrap"><FontAwesomeIcon icon={faEnvelope} /><input id="recovery-username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Nhập tên đăng nhập" required /></div></>}<button type="submit" className="customer-login-submit">{isReset ? "Lưu mật khẩu" : "Gửi hướng dẫn"} <FontAwesomeIcon icon={faArrowRight} /></button></form>}
          <p className="customer-login-register">Nhớ mật khẩu rồi? <Link to="/customer-login">Đăng nhập</Link></p>
        </div>
      </section>
    </main>
  );
};

export default CustomerRecoveryPage;