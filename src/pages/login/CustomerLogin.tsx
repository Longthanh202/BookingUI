import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      window.alert("Vui lòng nhập email và mật khẩu.");
      return;
    }
    localStorage.setItem("customerAccessToken", "customer-demo-token");
    window.alert("Đăng nhập bằng email thành công");
    navigate("/hotels");
  };

  const handleSocialLogin = (provider: string) => {
    localStorage.setItem("customerAccessToken", `customer-${provider}-demo-token`);
    window.alert(`Đăng nhập bằng ${provider} thành công`);
    navigate("/hotels");
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
          maxWidth: 480,
          borderRadius: 24,
          boxShadow: "0 24px 90px rgba(15, 23, 42, 0.12)",
        }}
      >
        <Card.Body>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Đăng nhập</h2>
            <p className="text-secondary">
              Sử dụng email hoặc đăng nhập nhanh với Facebook/Google
            </p>
          </div>

          <Form onSubmit={handleEmailLogin}>
            <Form.Group className="mb-3" controlId="customerEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="ví dụ: khach@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="customerPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100 mb-3">
              Đăng nhập
            </Button>
          </Form>

          <div className="text-center my-3">Hoặc</div>

          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            <Button
              variant="primary"
              style={{ flex: 1, backgroundColor: "#1877f2", borderColor: "#1877f2" }}
              onClick={() => handleSocialLogin("Facebook")}
            >
              Facebook
            </Button>

            <Button
              variant="outline-primary"
              style={{ flex: 1, borderColor: "#4285f4", color: "#4285f4" }}
              onClick={() => handleSocialLogin("Google")}
            >
              Google
            </Button>
          </div>

          <div className="text-center mt-4">
            <Link to="/customer-login">Quay lại</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerLogin;
