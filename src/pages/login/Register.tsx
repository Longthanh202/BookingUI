import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

const Register = () => {
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
          maxWidth: 520,
          borderRadius: 24,
          boxShadow: "0 24px 90px rgba(15, 23, 42, 0.12)",
        }}
      >
        <Card.Body>
          <h2 style={{ marginBottom: 16 }}>Đăng ký khách thuê phòng</h2>
          <p className="text-secondary" style={{ marginBottom: 24 }}>
            Hiện tại phần đăng ký chưa có dữ liệu thật. Bạn có thể sử dụng chức năng đăng nhập hoặc quay về trang chủ.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/customer-login">
              <Button variant="primary">Đăng nhập khách hàng</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Quay về trang chủ</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
