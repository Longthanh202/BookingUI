import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { loginApi } from "../../api/auth/auth.api";

interface LoginResponse {
  status: boolean;
  token: string;
  fullName: string;
  permissions: [];
  message: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

const Login = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  const loginMutation = useMutation<LoginResponse, unknown, LoginCredentials>({
    mutationFn: async ({ username, password }) => {
      const res = await loginApi(username, password);
      return res as LoginResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.token);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      window.alert("Đăng nhập thành công");
      navigate("/dashboard");
    },
    onError: () => {
      window.alert("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentials.username || !credentials.password) {
      window.alert("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }
    loginMutation.mutate(credentials);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 24,
          boxShadow: "0 24px 90px rgba(15, 23, 42, 0.12)",
        }}
      >
        <Card.Body>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Chào mừng trở lại</h2>
            <p className="text-secondary">
              Đăng nhập để tiếp tục quản lý hệ thống.
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-100"
              disabled={loginMutation.status === "pending"}
            >
              {loginMutation.status === "pending" ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <p className="mb-0">
              Khách thuê phòng? <Link to="/customer-login">Đăng nhập tại đây</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
