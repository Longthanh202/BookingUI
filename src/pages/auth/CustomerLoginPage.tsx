import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { loginApi } from "../../api/auth/auth.api";

interface GooglePayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        const user = await response.json();

        localStorage.setItem("accessToken", tokenResponse.access_token);

        localStorage.setItem("customerInfo", JSON.stringify(user));

        alert(`Xin chào ${user.name}`);

        navigate("/hotels");
      } catch (error) {
        console.error(error);
        alert("Đăng nhập Google thất bại");
      }
    },

    onError: () => {
      alert("Đăng nhập Google thất bại");
    },
  });

  const handleCustomerLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) {
      window.alert("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }
    const res = await loginApi(username, password);
    localStorage.setItem("accessToken", res.token);
    window.alert("Đăng nhập thành công");
    navigate("/");
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

          <Form onSubmit={handleCustomerLogin}>
            <Form.Group className="mb-3" controlId="customerEmail">
              <Form.Label>UserName</Form.Label>
              <Form.Control
                type="text"
                placeholder="example"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
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

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="primary"
              style={{
                flex: 1,
                backgroundColor: "#1877f2",
                borderColor: "#1877f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onClick={() => alert("Đăng nhập Facebook chưa được triển khai")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.3V12h2.3V9.8c0-2.3 1.4-3.6 3.4-3.6.98 0 2 .18 2 .18v2.2h-1.12c-1.1 0-1.44.68-1.44 1.38V12h2.45l-.39 2.9h-2.06v7A10 10 0 0022 12z" />
              </svg>
              Facebook
            </Button>

            <Button
              variant="outline-primary"
              style={{
                flex: 1,
                borderColor: "#4285f4",
                color: "#4285f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onClick={() => googleLogin()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path fill="#EA4335" d="M12 11.5v3.9h5.2c-.2 1.4-1.6 4.1-5.2 4.1-3.1 0-5.7-2.6-5.7-5.8s2.6-5.8 5.7-5.8c1.8 0 3 .8 3.7 1.5l2.5-2.4C17.4 4.6 15 3.5 12 3.5 7 3.5 3 7.5 3 12.5S7 21.5 12 21.5c6 0 9-4.5 9-8.5 0-.6-.1-1-.2-1.4H12z" />
              </svg>
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

export default CustomerLoginPage;
