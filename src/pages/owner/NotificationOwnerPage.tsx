import { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Alert, Badge, Card, ListGroup } from "react-bootstrap";
import OwnerPageShell from "../../components/owner/OwnerPageShell";

interface OwnerNotification {
  id: number;
  title: string;
  message: string;
  receivedAt: string;
}

const bookingReference = (payload: unknown) => {
  if (typeof payload === "string" || typeof payload === "number") return String(payload);
  if (!payload || typeof payload !== "object") return "";
  const value = payload as Record<string, unknown>;
  return String(value.bookingId ?? value.id ?? value.maBooking ?? "");
};

export default function NotificationOwnerPage() {
  const [notifications, setNotifications] = useState<OwnerNotification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Đang kết nối...");
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    let mounted = true;
    const baseUrl = (process.env.REACT_APP_BASE_URL || "http://localhost:5295").replace(/\/+$/, "");
    const connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/bookingHub`, {
        accessTokenFactory: () => localStorage.getItem("accessToken") || "",
      })
      .withAutomaticReconnect()
      .build();
    const addNotification = (title: string, message: string) => {
      setNotifications((current) => [
        { id: Date.now() + Math.random(), title, message, receivedAt: new Date().toLocaleString("vi-VN") },
        ...current,
      ]);
    };

    connection.on("OwnerBookingCreated", (payload: unknown) => {
      const reference = bookingReference(payload);
      addNotification("Có booking mới", reference ? `Mã booking: ${reference}` : "Một booking mới vừa được tạo.");
    });
    connection.on("BookingStatusChanged", (payload: unknown) => {
      const reference = bookingReference(payload);
      const value = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      const status = value.status ?? value.trangThai;
      addNotification("Trạng thái booking thay đổi", [
        reference ? `Mã booking: ${reference}` : "",
        status ? `Trạng thái: ${String(status)}` : "",
      ].filter(Boolean).join(" · ") || "Một booking đã được cập nhật.");
    });
    connection.onreconnecting(() => {
      if (mounted) setConnectionStatus("Đang kết nối lại...");
    });
    connection.onreconnected(() => {
      if (mounted) {
        setConnectionStatus("Đã kết nối");
        setConnectionError("");
      }
    });
    connection.onclose((error) => {
      if (mounted) {
        setConnectionStatus("Mất kết nối");
        if (error) setConnectionError(error.message);
      }
    });
    connection.start()
      .then(() => {
        if (mounted) setConnectionStatus("Đã kết nối");
      })
      .catch((error: Error) => {
        if (mounted) {
          setConnectionStatus("Không kết nối được");
          setConnectionError(error.message);
        }
      });

    return () => {
      mounted = false;
      void connection.stop();
    };
  }, []);

  return (
    <OwnerPageShell title="Thông báo" description="Cập nhật booking nhận trực tiếp từ bookingHub.">
      <Card className="owner-panel">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Thông báo realtime</h5>
            <Badge bg={connectionStatus === "Đã kết nối" ? "success" : "secondary"}>{connectionStatus}</Badge>
          </div>
          {connectionError && <Alert variant="warning">Không thể kết nối tới bookingHub: {connectionError}</Alert>}
          {notifications.length ? (
            <ListGroup variant="flush">
              {notifications.map((notification) => (
                <ListGroup.Item key={notification.id}>
                  <strong>{notification.title}</strong>
                  <div>{notification.message}</div>
                  <small className="text-muted">{notification.receivedAt}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted mb-0">Chưa nhận được sự kiện nào trong phiên này.</p>
          )}
        </Card.Body>
      </Card>
    </OwnerPageShell>
  );
}
