import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link, useNavigate } from "react-router-dom";
import {registerCustomer} from "../../api/auth/auth.api"
import {RegisterRequest} from "../../types/auth/RegisterRequest";

const CustomerRegistrationPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", fullName: "", phone: "", address: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = "Nhập tên đăng nhập";
    if (!form.password) e.password = "Nhập mật khẩu";
    if (!form.fullName.trim()) e.fullName = "Nhập họ và tên";
    if (!form.phone.trim()) e.phone = "Nhập số điện thoại";
    if (!form.email.trim()) e.email = "Nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email không hợp lệ";
    // address is optional
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
  ev?.preventDefault();

  if (!validate()) return;

  setSubmitting(true);

  try {
    const input: RegisterRequest = {
      username: form.username.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      email: form.email.trim(),
    };

    const result = await registerCustomer(input);

    window.alert("Đăng ký thành công");

    navigate("/customer-login");
  } catch (err: any) {
    console.error("Register error:", err);

    const message =
      err?.response?.data?.message ||
      err?.response?.data?.Message ||
      "Đăng ký thất bại";

    window.alert(message);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f6fb",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 820,
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
          border: "none",
        }}
      >
        <Card.Body>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ marginBottom: 4 }}>Đăng ký tài khoản</h2>
              <div className="text-secondary">Vui lòng điền thông tin bên dưới. Trường "Địa chỉ" là không bắt buộc.</div>
            </div>
          </div>

          <Form onSubmit={handleSubmit} className="mt-3">
            <Row className="g-3">
              <Col sm={6}>
                <Form.Group controlId="username">
                  <Form.Label className="small text-muted">Tên đăng nhập</Form.Label>
                  <Form.Control size="lg" value={form.username} onChange={(e) => handleChange("username", e.target.value)} isInvalid={!!errors.username} placeholder="user123" />
                  <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="password">
                  <Form.Label className="small text-muted">Mật khẩu</Form.Label>
                  <Form.Control size="lg" type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} isInvalid={!!errors.password} placeholder="******" />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col sm={12}>
                <Form.Group controlId="fullName">
                  <Form.Label className="small text-muted">Họ và tên</Form.Label>
                  <Form.Control value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} isInvalid={!!errors.fullName} placeholder="Nguyễn Văn A" />
                  <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="email">
                  <Form.Label className="small text-muted">Email</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} isInvalid={!!errors.email} placeholder="name@example.com" />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="phone">
                  <Form.Label className="small text-muted">Số điện thoại</Form.Label>
                  <Form.Control value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} isInvalid={!!errors.phone} placeholder="0912345678" />
                  <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col sm={12}>
                <Form.Group controlId="address">
                  <Form.Label className="small text-muted">Địa chỉ (không bắt buộc)</Form.Label>
                  <Form.Control value={form.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Số nhà, đường, quận, thành phố" />
                </Form.Group>
              </Col>

              <Col sm={12} className="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                    {submitting ? "Đang gửi..." : "Đăng ký"}
                  </Button>
                  <Link to="/customer-login" style={{ marginLeft: 12 }}>
                    <Button variant="outline-secondary" size="lg">Đăng nhập</Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerRegistrationPage;
