import React from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import { Booking } from "../../types/booking/Booking";
import HomeHeader from "../../components/home/home-page/HomeHeader/HomeHeader";
import { getAllBookings } from "../../api/booking/booking.api";

const BookingHistory = () => {
  const { data: bookings, isLoading } = useQuery<Booking[], Error>({
    queryKey: ["bookings"],
    queryFn: getAllBookings,
  });
  const bookingsList: Booking[] = bookings ?? [];

  return (
    <div>
      <HomeHeader />
      <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 24 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Card style={{ borderRadius: 12 }}>
            <Card.Body>
              <h4>Lịch sử đặt phòng</h4>
              {isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Phòng</th>
                      <th>Thời gian</th>
                      <th>Khách</th>
                      <th>Thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-secondary">
                          Chưa có lịch sử đặt phòng.
                        </td>
                      </tr>
                    ) : (
                      bookingsList.map((booking) => (
                        <tr key={booking.id || `${booking.roomName}-${booking.startDate}`}> 
                          <td>
                            <strong>{booking.roomName}</strong>
                            <div className="text-secondary">{booking.paymentMethod}</div>
                          </td>
                          <td>
                            {booking.startDate} → {booking.endDate}
                          </td>
                          <td>
                            {booking.guests} khách
                            <div className="text-secondary">
                              {booking.totalAmount?.toLocaleString?.()} VND
                            </div>
                          </td>
                          <td>
                            <Badge bg={
                                booking.paymentStatus === "paid"
                                  ? "success"
                                  : booking.paymentStatus === "pending"
                                  ? "warning"
                                  : "danger"
                              }>
                              {booking.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
