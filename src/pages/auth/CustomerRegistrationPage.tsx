import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCheck, faEnvelope, faLocationDot, faLock, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";
import { registerCustomer } from "../../api/auth/auth.api";
import { showToast } from "../../components/common/Toast";
import { RegisterRequest } from "../../types/auth/RegisterRequest";
import "./CustomerRegistrationPage.css";

const CustomerRegistrationPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", fullName: "", phone: "", address: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.username.trim()) nextErrors.username = "Nhập tên đăng nhập";
    if (form.password.length < 6) nextErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    if (!form.fullName.trim()) nextErrors.fullName = "Nhập họ và tên";
    if (!form.phone.trim()) nextErrors.phone = "Nhập số điện thoại";
    if (!form.email.trim()) nextErrors.email = "Nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Email không hợp lệ";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const input: RegisterRequest = {
        username: form.username.trim(), password: form.password, fullName: form.fullName.trim(),
        phone: form.phone.trim(), address: form.address.trim(), email: form.email.trim(),
      };
      await registerCustomer(input);
      showToast("Đăng ký thành công", "success");
      navigate("/customer-login");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.Message || "Đăng ký thất bại";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  const field = (id: keyof typeof form, label: string, icon: any, type = "text", placeholder = "") => (
    <div className={`customer-register-field ${errors[id] ? "has-error" : ""}`}>
      <label htmlFor={`register-${id}`}>{label}</label>
      <div className="customer-register-input"><FontAwesomeIcon icon={icon} /><input id={`register-${id}`} type={type} value={form[id]} placeholder={placeholder} onChange={(event) => handleChange(id, event.target.value)} autoComplete={id === "password" ? "new-password" : id} /></div>
      {errors[id] && <small>{errors[id]}</small>}
    </div>
  );

  return (
    <main className="customer-register-page">
      <section className="customer-register-shell">
        <div className="customer-register-story">
          <Link to="/" className="customer-register-logo">Stayro<span /></Link>
          <div className="customer-register-story-copy">
            <div className="customer-register-kicker"><span /> JOIN THE JOURNEY</div>
            <h1>Một tài khoản,<br /><em>ngàn chuyến đi.</em></h1>
            <p>Lưu lại những nơi bạn yêu thích, quản lý booking dễ dàng và nhận ưu đãi riêng cho mỗi hành trình.</p>
          </div>
          <div className="customer-register-benefits"><div><FontAwesomeIcon icon={faCheck} /><span>Đặt phòng nhanh hơn</span></div><div><FontAwesomeIcon icon={faCheck} /><span>Theo dõi booking mọi lúc</span></div><div><FontAwesomeIcon icon={faCheck} /><span>Ưu đãi dành riêng cho bạn</span></div></div>
          <Link to="/" className="customer-register-back"><FontAwesomeIcon icon={faArrowLeft} /> Về trang khám phá</Link>
        </div>
        <div className="customer-register-form-panel">
          <Link to="/" className="customer-register-mobile-logo">Stayro<span /></Link>
          <div className="customer-register-heading"><h2>Tạo tài khoản Stayro</h2><p>Bắt đầu lưu lại những nơi bạn muốn đến.</p></div>
          <form onSubmit={handleSubmit} className="customer-register-form">
            {errors.form && <div className="customer-register-error" role="alert">{errors.form}</div>}
            <div className="customer-register-grid">{field("fullName", "Họ và tên", faUser, "text", "Nguyễn Văn A")}{field("username", "Tên đăng nhập", faUser, "text", "user123")}{field("email", "Email", faEnvelope, "email", "name@example.com")}{field("phone", "Số điện thoại", faPhone, "tel", "0912 345 678")}{field("password", "Mật khẩu", faLock, "password", "Tối thiểu 6 ký tự")}<div className="customer-register-field"> <label htmlFor="register-address">Địa chỉ <span>(không bắt buộc)</span></label><div className="customer-register-input"><FontAwesomeIcon icon={faLocationDot} /><input id="register-address" type="text" value={form.address} placeholder="Số nhà, đường, thành phố" onChange={(event) => handleChange("address", event.target.value)} /></div></div></div>
            <label className="customer-register-check"><input type="checkbox" required /><span>Tôi đồng ý với <a href="/" onClick={(event) => event.preventDefault()}>Điều khoản sử dụng</a> và <a href="/" onClick={(event) => event.preventDefault()}>Chính sách bảo mật</a>.</span></label>
            <button type="submit" className="customer-register-submit" disabled={submitting}>{submitting ? "Đang tạo tài khoản..." : <>Tạo tài khoản <FontAwesomeIcon icon={faArrowRight} /></>}</button>
          </form>
          <p className="customer-register-login">Đã có tài khoản? <Link to="/customer-login">Đăng nhập</Link></p>
        </div>
      </section>
    </main>
  );
};

export default CustomerRegistrationPage;
