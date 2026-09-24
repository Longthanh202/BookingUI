import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Form } from "react-bootstrap";
import { getOwnerAllBookings } from "../../api/booking/booking.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { BookingTable, responseRows } from "../../components/owner/OwnerWorkspaceData";

export default function BookingOwnerPage() {
	const [search, setSearch] = useState("");
	const { data, isLoading } = useQuery({ queryKey: ["owner-all-bookings"], queryFn: () => getOwnerAllBookings({ page: 1, pageSize: 200 }) });
	const bookings = responseRows(data); const filtered = bookings.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
	return <OwnerPageShell title="Quản lý booking" description="Xác nhận, nhận phòng, trả phòng và theo dõi toàn bộ booking của property"><Card className="owner-panel"><Card.Body className="p-0"><div className="owner-toolbar"><div><h5>Danh sách booking</h5><span>{bookings.length} booking từ API</span></div><Form.Control className="w-auto" placeholder="Tìm booking hoặc khách" value={search} onChange={(event) => setSearch(event.target.value)} /></div>{isLoading ? <div className="p-4">Đang tải booking...</div> : <BookingTable rows={filtered} />}</Card.Body></Card></OwnerPageShell>;
}
