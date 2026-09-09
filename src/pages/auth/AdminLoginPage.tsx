import React, { useState } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

import { loginApi } from "../../api/auth/auth.api";
import { getUser } from "../../utils/auth/auth";

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

const AdminLoginPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ============================
  // STATE
  // ============================

  const [showPassword, setShowPassword] =
    useState(false);

  const [credentials, setCredentials] =
    useState<LoginCredentials>({
      username: "",
      password: "",
    });

  // Toast
  const [showErrorToast, setShowErrorToast] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  // ============================
  // LOGIN MUTATION
  // ============================

  const loginMutation = useMutation<
    LoginResponse,
    unknown,
    LoginCredentials
  >({
    mutationFn: async ({
      username,
      password,
    }) => {
      const res = await loginApi(
        username,
        password
      );

      return res as LoginResponse;
    },

    // ============================
    // LOGIN SUCCESS
    // ============================

    onSuccess: async (data) => {
      // Lưu token
      localStorage.setItem(
        "accessToken",
        data.token
      );

      // Refresh profile
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      // Lấy thông tin user từ token
      const user = getUser();

      const role = user?.Role || "";
      const r = String(role).toUpperCase();

      // Không hiển thị Toast/Alert khi thành công

      // ADMIN
      if (r === "ADMIN") {
        navigate("/admin", {
          replace: true,
        });

        return;
      }

      // OWNER / HOTEL
      if (
        r === "OWNER" ||
        r === "HOTEL"
      ) {
        navigate("/owner", {
          replace: true,
        });

        return;
      }

      // CUSTOMER / ROLE KHÁC
      navigate("/", {
        replace: true,
      });
    },

    // ============================
    // LOGIN ERROR
    // ============================

    onError: (error) => {
      console.error(
        "Login error:",
        error
      );

      setErrorMessage(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu."
      );

      setShowErrorToast(true);
    },
  });

  // ============================
  // SUBMIT
  // ============================

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Validate
    if (
      !credentials.username.trim() ||
      !credentials.password
    ) {
      setErrorMessage(
        "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu."
      );

      setShowErrorToast(true);

      return;
    }

    loginMutation.mutate(
      credentials
    );
  };

  // ============================
  // LOADING
  // ============================

  const isLoading =
    loginMutation.status === "pending";

  // ============================
  // UI
  // ============================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      {/* ================================= */}
      {/* ERROR TOAST */}
      {/* ================================= */}

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{
          zIndex: 9999,
        }}
      >
        <Toast
          show={showErrorToast}
          onClose={() =>
            setShowErrorToast(false)
          }
          delay={4000}
          autohide
          bg="danger"
        >
          <Toast.Header>
            <strong className="me-auto">
              Đăng nhập
            </strong>

            <small>
              Thông báo
            </small>
          </Toast.Header>

          <Toast.Body className="text-white">
            {errorMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* ================================= */}
      {/* MAIN CONTAINER */}
      {/* ================================= */}

      <div
        style={{
          width: "100%",
          maxWidth: 1050,
          minHeight: 650,
          background: "#ffffff",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow:
            "0 25px 80px rgba(15, 23, 42, 0.12)",
          display: "flex",
        }}
      >
        {/* ================================= */}
        {/* LEFT - BRANDING */}
        {/* ================================= */}

        <div
          className="d-none d-lg-flex"
          style={{
            width: "48%",
            padding: 55,
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Decorative circle 1 */}

          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.08)",
              top: -120,
              right: -100,
            }}
          />

          {/* Decorative circle 2 */}

          <div
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.06)",
              bottom: -80,
              left: -80,
            }}
          />

          {/* ================================= */}
          {/* LOGO */}
          {/* ================================= */}

          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 15,
                  background:
                    "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 25,
                  fontWeight: 800,
                  border:
                    "1px solid rgba(255,255,255,0.2)",
                }}
              >
                S
              </div>

              <div>
                <div
                  style={{
                    fontSize: 23,
                    fontWeight: 800,
                  }}
                >
                  Stayro
                </div>

                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.75,
                  }}
                >
                  Management System
                </div>
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* CONTENT */}
          {/* ================================= */}

          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                opacity: 0.8,
                marginBottom: 14,
                letterSpacing: 1,
              }}
            >
              MANAGEMENT PLATFORM
            </div>

            <h1
              style={{
                fontSize: 42,
                lineHeight: 1.15,
                fontWeight: 800,
                marginBottom: 20,
              }}
            >
              Quản lý hệ thống
              <br />
              đơn giản hơn.
            </h1>

            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                opacity: 0.85,
                maxWidth: 400,
                marginBottom: 35,
              }}
            >
              Quản lý khách sạn, phòng,
              booking và các hoạt động kinh
              doanh trên một nền tảng duy nhất.
            </p>

            {/* ================================= */}
            {/* FEATURES */}
            {/* ================================= */}

            <div className="d-flex flex-column gap-3">
              {/* Feature 1 */}

              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </div>

                <span>
                  Quản lý khách sạn và phòng
                </span>
              </div>

              {/* Feature 2 */}

              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </div>

                <span>
                  Quản lý đặt phòng
                </span>
              </div>

              {/* Feature 3 */}

              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </div>

                <span>
                  Theo dõi hoạt động kinh doanh
                </span>
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* FOOTER */}
          {/* ================================= */}

          <div
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: 12,
              opacity: 0.65,
            }}
          >
            © 2026 Stayro. All rights reserved.
          </div>
        </div>

        {/* ================================= */}
        {/* RIGHT - LOGIN */}
        {/* ================================= */}

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px 55px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          >
            {/* ================================= */}
            {/* MOBILE LOGO */}
            {/* ================================= */}

            <div className="d-lg-none text-center mb-4">
              <div
                style={{
                  width: 52,
                  height: 52,
                  margin: "0 auto 12px",
                  borderRadius: 15,
                  background: "#eef2ff",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                W
              </div>

              <h4 className="fw-bold mb-1">
                Stayro Management System
              </h4>
            </div>

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="mb-4">
              <div
                style={{
                  color: "#6366f1",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  marginBottom: 8,
                }}
              >
                WELCOME BACK
              </div>

              <h2
                style={{
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 10,
                }}
              >
                Đăng nhập
              </h2>

              <p
                style={{
                  color: "#6b7280",
                  marginBottom: 0,
                }}
              >
                Đăng nhập vào tài khoản quản trị
                của bạn.
              </p>
            </div>

            {/* ================================= */}
            {/* LOGIN FORM */}
            {/* ================================= */}

            <Form onSubmit={handleSubmit}>
              {/* USERNAME */}

              <Form.Group
                className="mb-4"
                controlId="username"
              >
                <Form.Label
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Tên đăng nhập
                </Form.Label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#9ca3af",
                      fontSize: 17,
                      zIndex: 2,
                    }}
                  >
                    👤
                  </span>

                  <Form.Control
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={
                      credentials.username
                    }
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        username:
                          e.target.value,
                      })
                    }
                    required
                    style={{
                      height: 52,
                      borderRadius: 13,
                      paddingLeft: 48,
                      border:
                        "1px solid #e5e7eb",
                      background: "#f9fafb",
                    }}
                  />
                </div>
              </Form.Group>

              {/* PASSWORD */}

              <Form.Group
                className="mb-4"
                controlId="password"
              >
                <Form.Label
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Mật khẩu
                </Form.Label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#9ca3af",
                      fontSize: 17,
                      zIndex: 2,
                    }}
                  >
                    🔒
                  </span>

                  <Form.Control
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Nhập mật khẩu"
                    value={
                      credentials.password
                    }
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password:
                          e.target.value,
                      })
                    }
                    required
                    style={{
                      height: 52,
                      borderRadius: 13,
                      paddingLeft: 48,
                      paddingRight: 50,
                      border:
                        "1px solid #e5e7eb",
                      background: "#f9fafb",
                    }}
                  />

                  {/* SHOW / HIDE PASSWORD */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background:
                        "transparent",
                      color: "#6b7280",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    {showPassword
                      ? "🙈"
                      : "👁"}
                  </button>
                </div>
              </Form.Group>

              {/* LOGIN BUTTON */}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-100 border-0"
                style={{
                  height: 54,
                  borderRadius: 13,
                  background:
                    "linear-gradient(135deg, #4f46e5, #6366f1)",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow:
                    "0 10px 25px rgba(79,70,229,0.25)",
                }}
              >
                {isLoading ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />

                    Đang đăng nhập...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </Form>

            {/* ================================= */}
            {/* DIVIDER */}
            {/* ================================= */}

            <div
              className="d-flex align-items-center gap-3 my-4"
            >
              <div
                style={{
                  height: 1,
                  background: "#e5e7eb",
                  flex: 1,
                }}
              />

              <span
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                }}
              >
                hoặc
              </span>

              <div
                style={{
                  height: 1,
                  background: "#e5e7eb",
                  flex: 1,
                }}
              />
            </div>

            {/* ================================= */}
            {/* CUSTOMER LOGIN */}
            {/* ================================= */}

            <div
              style={{
                padding: 16,
                borderRadius: 14,
                background: "#f8fafc",
                border:
                  "1px solid #eef0f4",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#6b7280",
                  fontSize: 14,
                  marginBottom: 7,
                }}
              >
                Bạn là khách thuê phòng?
              </div>

              <Link
                to="/customer-login"
                style={{
                  color: "#4f46e5",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                Đăng nhập tài khoản khách hàng →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;