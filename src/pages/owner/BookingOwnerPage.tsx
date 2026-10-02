import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, Form, Table } from "react-bootstrap";
import { cancelOwnerBooking, checkInBooking, checkOutBooking, confirmBooking, getOwnerAllBookings, rejectOwnerBooking } from "../../api/booking/booking.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { responseRows, valueOf } from "../../components/owner/OwnerWorkspaceData";

const pendingStatuses = ["CHO_XAC_NHAN", "Chờ xác nhận"];
const confirmedStatuses = ["DA_XAC_NHAN", "Đã xác nhận"];
const checkedInStatuses = ["DA_CHECK_IN", "Đã nhận phòng", "CHECKED_IN"];

export default function BookingOwnerPage() {
	const [search, setSearch] = useState("");
	const [notice, setNotice] = useState("");
	const client = useQueryClient();
	const { data, isLoading } = useQuery({ queryKey: ["owner-all-bookings"], queryFn: () => getOwnerAllBookings({ page: 1, pageSize: 200 }) });
	const bookings = responseRows(data);
	const filtered = bookings.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
	const transition = useMutation({
		mutationFn: ({ id, action }: { id: string; action: string }) => {
			if (action === "confirm") return confirmBooking(id);
			if (action === "reject") return rejectOwnerBooking(id);
			if (action === "cancel") return cancelOwnerBooking(id);
			if (action === "check-in") return checkInBooking(id);
			return checkOutBooking(id);
		},
		onSuccess: () => {
			setNotice("Đã cập nhật trạng thái booking.");
			client.invalidateQueries({ queryKey: ["owner-all-bookings"] });
		},
		onError: (error: any) => setNotice(error?.response?.data?.message || "Không thể cập nhật booking."),
	});
	const action = (id: string, operation: string, label: string, variant = "outline-primary") => <Button size="sm" variant={variant} disabled={transition.isPending} onClick={() => {
		if ((operation === "cancel" || operation === "reject") && !window.confirm(`Xác nhận ${label.toLowerCase()} booking này?`)) return;
		transition.mutate({ id, action: operation });
	}}>{label}</Button>;
	return <OwnerPageShell title="Quản lý booking" description="Xác nhận, từ chối, check-in, checkout hoặc hủy booking thuộc property." notice={notice} onDismissNotice={() => setNotice("")}><Card className="owner-panel"><Card.Body className="p-0"><div className="owner-toolbar"><div><h5>Danh sách booking</h5><span>{bookings.length} booking từ API</span></div><Form.Control className="w-auto" placeholder="Tìm booking hoặc khách" value={search} onChange={(event) => setSearch(event.target.value)} /></div>{isLoading ? <div className="p-4">Đang tải booking...</div> : <Table responsive className="owner-table align-middle mb-0"><thead><tr><th>Booking</th><th>Khách hàng</th><th>Phòng</th><th>Ngày lưu trú</th><th>Giá trị</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{filtered.map((row, index) => {
		const id = String(valueOf(row, "id", "bookingId", "maBooking"));
		const status = String(valueOf(row, "trangThai", "status"));
		const actions = pendingStatuses.includes(status) ? <>{action(id, "confirm", "Xác nhận")}{action(id, "reject", "Từ chối", "outline-danger")}</> : confirmedStatuses.includes(status) ? <>{action(id, "check-in", "Check-in")}{action(id, "cancel", "Hủy booking", "outline-danger")}</> : checkedInStatuses.includes(status) ? action(id, "check-out", "Checkout") : null;
		return <tr key={id === "-" ? index : id}><td><strong>{id}</strong></td><td>{valueOf(row, "tenKhachHang", "guest", "hoTen")}</td><td>{valueOf(row, "tenLoaiPhong", "room")}</td><td>{valueOf(row, "ngayNhanPhong", "checkIn")} - {valueOf(row, "ngayTraPhong", "checkOut")}</td><td>{Number(valueOf(row, "tongTien", "amount") === "-" ? 0 : valueOf(row, "tongTien", "amount")).toLocaleString("vi-VN")} đ</td><td><Badge bg="secondary">{status}</Badge></td><td><div className="d-flex gap-2">{actions}</div></td></tr>;
	})}</tbody></Table>}</Card.Body></Card></OwnerPageShell>;
}
