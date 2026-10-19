import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Form } from "react-bootstrap";
import { registerOwner } from "../../api/auth/auth.api";
import { OwnerRegisterRequest } from "../../types/auth/RegisterRequest";
import "../../styles/auth/CustomerRegistrationPage.css";
import "../../styles/auth/OwnerRegistrationPage.css";

const initialForm: OwnerRegisterRequest = {
  username: "",
  password: "",
  fullName: "",
  phone: "",
  address: "",
  email: "",
  bankName: "",
  bankAccountNumber: "",
  bankAccountHolder: "",
  bankBranch: "",
};

const OwnerRegistrationPage = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof OwnerRegisterRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = form.username.trim();
    const password = form.password;
    if (!username || username.length > 100) {
      setError("Tên đăng nhập là bắt buộc và tối đa 100 ký tự.");
      return;
    }
    if (password.length < 8 || password.length > 100) {
      setError("Mật khẩu phải từ 8 đến 100 ký tự.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Email không hợp lệ.");
      return;
    }
    const requiredFields = [
      ["fullName", form.fullName],
      ["phone", form.phone],
      ["address", form.address],
      ["bankName", form.bankName],
      ["bankAccountNumber", form.bankAccountNumber],
      ["bankAccountHolder", form.bankAccountHolder],
    ] as const;
    if (requiredFields.some(([, value]) => !value.trim())) {
      setError("Vui lòng điền đầy đủ thông tin cá nhân và tài khoản ngân hàng.");
      return;
    }
    const phone = form.phone.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(phone) || phoneDigits.length < 9 || phoneDigits.length > 15) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await registerOwner({
        ...form,
        username,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        bankName: form.bankName.trim(),
        bankAccountNumber: form.bankAccountNumber.trim(),
        bankAccountHolder: form.bankAccountHolder.trim(),
        bankBranch: form.bankBranch?.trim() || undefined,
      });
      setSubmitted(true);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || requestError?.response?.data?.Message || "Không thể gửi hồ sơ đăng ký. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const fields: { key: keyof OwnerRegisterRequest; label: string; type?: string; autoComplete?: string }[] = [
    { key: "fullName", label: "Họ và tên", autoComplete: "name" },
    { key: "username", label: "Tên đăng nhập", autoComplete: "username" },
    { key: "email", label: "Email", type: "email", autoComplete: "email" },
    { key: "phone", label: "Số điện thoại", type: "tel", autoComplete: "tel" },
    { key: "password", label: "Mật khẩu", type: "password", autoComplete: "new-password" },
    { key: "address", label: "Địa chỉ", autoComplete: "street-address" },
    { key: "bankName", label: "Ngân hàng" },
    { key: "bankAccountNumber", label: "Số tài khoản" },
    { key: "bankAccountHolder", label: "Chủ tài khoản" },
    { key: "bankBranch", label: "Chi nhánh (không bắt buộc)" },
  ];

  return (
    <main className="customer-register-page owner-register-page">
      <section className="customer-register-shell owner-register-shell">
        <aside className="customer-register-story">
          <Link to="/" className="customer-register-logo">Stayro<span /></Link>
          <div className="customer-register-story-copy">
            <div className="customer-register-kicker"><span /> ĐỒNG HÀNH CÙNG STAYRO</div>
            <h1>Đưa khách sạn<br /><em>đến gần hơn.</em></h1>
            <p>Gửi hồ sơ đối tác và thông tin tài khoản ngân hàng. Đội ngũ quản trị sẽ xem xét trước khi kích hoạt tài khoản.</p>
          </div>
          <div className="customer-register-benefits"><div>Hồ sơ được Admin xét duyệt</div><div>Tài khoản chỉ hoạt động sau khi duyệt</div></div>
          <Link to="/register" className="customer-register-back">Đăng ký tài khoản khách hàng</Link>
        </aside>
        <section className="customer-register-form-panel owner-register-form-panel">
          <Link to="/" className="customer-register-mobile-logo">Stayro<span /></Link>
          <div className="customer-register-heading"><h2>Đăng ký tài khoản Owner</h2><p>Điền thông tin chủ sở hữu và tài khoản nhận thanh toán.</p></div>
          {submitted ? (
            <Alert variant="success" role="status">
              Đã gửi hồ sơ thành công. Tài khoản đang chờ Admin duyệt và chưa thể đăng nhập. Chúng tôi sẽ gửi email thông báo kết quả.
            </Alert>
          ) : (
            <Form onSubmit={submit} className="owner-register-form">
              {error && <Alert variant="danger" role="alert">{error}</Alert>}
              <div className="customer-register-grid">
                {fields.map(({ key, label, type = "text", autoComplete }) => (
                  <Form.Group className="customer-register-field" key={key}>
                    <Form.Label htmlFor={`owner-register-${key}`}>{label}</Form.Label>
                    <Form.Control
                      id={`owner-register-${key}`}
                      type={type}
                      required={key !== "bankBranch"}
                      maxLength={key === "username" ? 100 : key === "password" ? 100 : undefined}
                      minLength={key === "password" ? 8 : undefined}
                      autoComplete={autoComplete}
                      value={form[key] ?? ""}
                      onChange={(event) => update(key, event.target.value)}
                    />
                  </Form.Group>
                ))}
              </div>
              <Button className="customer-register-submit" type="submit" disabled={submitting}>
                {submitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ đăng ký"}
              </Button>
            </Form>
          )}
          <p className="customer-register-login">Đã có tài khoản? <Link to="/owner/login">Đăng nhập</Link></p>
        </section>
      </section>
    </main>
  );
};

export default OwnerRegistrationPage;
