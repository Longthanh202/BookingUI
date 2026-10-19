import { useMemo, useState } from "react";
import {
  useAppMutation,
  useAppQueryClient,
} from "../../hooks/useAppReactQuery";
import { Alert, Button, Card, Form, Table } from "react-bootstrap";
import Modal from "../../components/common/SystemModal";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faCreditCard, faHotel, faMoneyBillWave, faPlus, faUser, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  useOwnerBookingDetails,
  useOwnerCalendar,
  useOwnerCalendarHotels,
} from "../../hooks/useOwnerQueries";
import { createAvailabilityBlock, deleteAvailabilityBlock } from "../../api/owner.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { rows } from "../../components/owner/OwnerDataTable";
import "../../styles/owner/CalendarOwnerPage.css";

const getValue = (item: any, ...keys: string[]) => keys.map((key) => item?.[key] ?? item?.[key.charAt(0).toUpperCase() + key.slice(1)]).find((value) => value !== undefined && value !== null);
const dateOnly = (value: unknown) => {
	if (typeof value !== "string" || !value) return "";
	const dateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
	return dateMatch ? dateMatch[0] : "";
};
const formatDate = (value: unknown) => {
	const date = dateOnly(value);
	return date ? new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN") : "-";
};
const formatMoney = (value: unknown) => `${(Number(value) || 0).toLocaleString("vi-VN")} đ`;
const statusLabels: Record<string, string> = {
	CHO_XAC_NHAN: "Chờ xác nhận",
	DA_XAC_NHAN: "Đã xác nhận",
	DA_CHECK_IN: "Đã nhận phòng",
	DA_CHECK_OUT: "Đã trả phòng",
	HOAN_TAT: "Hoàn tất",
	DA_HUY: "Đã hủy",
};
const localIso = (date: Date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
const initialCalendarRange = () => {
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
	const end = new Date(start);
	end.setDate(end.getDate() + 7);
	return { from: localIso(start), to: localIso(end) };
};

export default function CalendarOwnerPage() {
	const client = useAppQueryClient();
	const [calendarRange, setCalendarRange] = useState(initialCalendarRange);
	const [showBlockForm, setShowBlockForm] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<{ type: "booking" | "block"; id: string; item: any } | null>(null);
	const [roomId, setRoomId] = useState("");
	const [startAt, setStartAt] = useState("");
	const [endAt, setEndAt] = useState("");
	const [reason, setReason] = useState("");
	const [error, setError] = useState("");
	const earliestBlockDate = new Date();
	earliestBlockDate.setDate(earliestBlockDate.getDate() + 1);
	const earliestBlockDateText = earliestBlockDate.toLocaleDateString("en-CA");
	const hotels = useOwnerCalendarHotels();
	const ownerHotels = rows(hotels.data);
	const ownerHotelIds = ownerHotels
		.map((hotel: any) => String(getValue(hotel, "id", "khachSanId") ?? ""))
		.filter(Boolean);
	const calendar = useOwnerCalendar(
		ownerHotels,
		ownerHotelIds,
		calendarRange.from,
		calendarRange.to,
		!hotels.isLoading && !hotels.isError && ownerHotelIds.length > 0
	);
	const rooms = rows(calendar.data?.rooms);
	const bookings = rows(calendar.data?.bookings);
	const blocks = rows(calendar.data?.blocks);
	const bookingDetailsQuery = useOwnerBookingDetails(selectedEvent?.id, selectedEvent?.type === "booking");
	const bookingDetails = bookingDetailsQuery.data?.data ?? bookingDetailsQuery.data ?? selectedEvent?.item;
	const createBlock = useAppMutation({
		mutationFn: () => createAvailabilityBlock(roomId, { startAt: new Date(`${startAt}T00:00:00`).toISOString(), endAt: new Date(`${endAt}T00:00:00`).toISOString(), reason }),
		onSuccess: () => {
			setShowBlockForm(false);
			setRoomId(""); setStartAt(""); setEndAt(""); setReason(""); setError("");
			client.invalidateQueries({ queryKey: ["owner-calendar"] });
		},
		onError: (failure: any) => setError(failure?.response?.data?.message || "Không thể chặn phòng trong khoảng thời gian này."),
	});
	const removeBlock = useAppMutation({
		mutationFn: deleteAvailabilityBlock,
		onSuccess: () => {
			setSelectedEvent(null);
			client.invalidateQueries({ queryKey: ["owner-calendar"] });
		},
		onError: (failure: any) => setError(failure?.response?.data?.message || "Không thể gỡ khoảng chặn."),
	});
	const events = useMemo(() => {
		const bookingEvents = bookings.flatMap((item: any, index: number) => {
			const start = dateOnly(getValue(item, "startAt", "checkIn", "ngayNhan", "ngayNhanPhong", "ngayBatDau"));
			const checkOut = dateOnly(getValue(item, "endAt", "checkOut", "ngayTra", "ngayTraPhong", "ngayKetThuc"));
			if (!start || !checkOut) return [];
			const endDate = new Date(`${checkOut}T00:00:00`);
			endDate.setDate(endDate.getDate() + 1);
			const end = dateOnly(localIso(endDate));
			const id = String(getValue(item, "id", "bookingId", "datPhongId") ?? index);
			const details = rows(getValue(item, "chiTietDatPhongs", "bookingDetails"));
			const roomLabels = details.map((detail: any) => {
				const numbers = rows(getValue(detail, "phongs", "rooms"))
					.map((room: any) => getValue(room, "soPhong", "name", "maPhong"))
					.filter(Boolean);
				return numbers.length ? numbers.join(", ") : getValue(detail, "tenLoaiPhong", "roomName");
			}).filter(Boolean);
			const guest = getValue(item, "tenKhachHang", "guestName", "hoTen") ?? "Booking";
			const bookingCode = getValue(item, "maDatPhong") ?? "";
			const title = [bookingCode, guest, item._hotelName, roomLabels.join(", ")].filter(Boolean).join(" · ");
			return [{
				id: `booking-${item._hotelId}-${id}-${index}`,
				title,
				start,
				end,
				allDay: true,
				backgroundColor: "#e06b36",
				borderColor: "#e06b36",
				extendedProps: { type: "booking", id, item },
			}];
		});
		const blockEvents = blocks.flatMap((item: any, index: number) => {
			const start = dateOnly(getValue(item, "startAt", "ngayBatDau", "checkIn"));
			const end = dateOnly(getValue(item, "endAt", "ngayKetThuc", "checkOut"));
			if (!start || !end) return [];
			const id = String(getValue(item, "id", "blockId") ?? index);
			return [{
				id: `block-${id}-${index}`,
				title: `Đã chặn · ${getValue(item, "reason") ?? "Bảo trì"}`,
				start,
				end,
				allDay: true,
				backgroundColor: "#75808a",
				borderColor: "#75808a",
				extendedProps: { type: "block", id, item },
			}];
		});
		return [...bookingEvents, ...blockEvents];
	}, [bookings, blocks]);
	const submitBlock = () => {
		if (!roomId || !startAt || !endAt || !reason.trim() || startAt < earliestBlockDateText || endAt <= startAt) {
			setError("Chọn phòng, lý do và khoảng thời gian trong tương lai hợp lệ.");
			return;
		}
		createBlock.mutate();
	};
	const selectedBooking = selectedEvent?.type === "booking" ? bookingDetails : null;
	const bookingRooms = rows(getValue(selectedBooking, "chiTietDatPhongs", "bookingDetails"));
	const bookingAmount = bookingRooms.reduce((total: number, detail: any) => total + (Number(getValue(detail, "gia", "price")) || 0), 0);
	const bookingCustomer = getValue(selectedBooking, "khachHang", "customer");
	const bookingStatus = getValue(selectedBooking, "trangThai", "status");
	const bookingStatusLabel = statusLabels[bookingStatus] ?? bookingStatus ?? "-";
	const selectedHotelName = getValue(selectedBooking, "tenKhachSan", "hotelName")
		?? selectedEvent?.item?._hotelName
		?? "-";

	return <OwnerPageShell title="Lịch phòng" description="Theo dõi booking và khoảng thời gian bị chặn tại tất cả khách sạn của bạn.">
		<>
			<Card className="owner-panel"><Card.Body>
				<div className="owner-toolbar px-0 pt-0">
					<div><h5>Lịch tất cả khách sạn</h5><span>Nhấp vào booking trên lịch để xem chi tiết</span></div>
					<Button variant="dark" disabled={!rooms.length} onClick={() => { setError(""); setShowBlockForm(true); }}><FontAwesomeIcon icon={faPlus} /> Chặn ngày</Button>
				</div>
				{error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
				{hotels.isLoading || calendar.isLoading ? <p className="text-muted mb-0">Đang tải lịch các khách sạn...</p> : hotels.isError ? <Alert variant="danger">Không thể tải danh sách khách sạn.</Alert> : calendar.isError ? <Alert variant="danger">Không thể tải lịch một hoặc nhiều khách sạn.</Alert> : !ownerHotelIds.length ? <p className="text-muted mb-0">Tài khoản Owner chưa có khách sạn để hiển thị.</p> : <div className="owner-booking-calendar">
					<FullCalendar
						plugins={[dayGridPlugin, interactionPlugin]}
						initialView="dayGridMonth"
						locale={viLocale}
						headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,dayGridWeek" }}
						buttonText={{ today: "Hôm nay", month: "Tháng", week: "Tuần" }}
						events={events}
						datesSet={(dateInfo) => {
							const nextRange = { from: localIso(dateInfo.start), to: localIso(dateInfo.end) };
							setCalendarRange((current) => current.from === nextRange.from && current.to === nextRange.to ? current : nextRange);
						}}
						eventClick={(info) => {
							const { type, id, item } = info.event.extendedProps;
							if (type === "booking" || type === "block") setSelectedEvent({ type, id, item });
						}}
						height="auto"
						dayMaxEvents
						eventDisplay="block"
					/>
					{!events.length && <p className="text-muted mt-3 mb-0">Chưa có booking hoặc khoảng chặn trong lịch.</p>}
				</div>}
				{rooms.length > 0 && <div className="small text-muted mt-3">Đang hiển thị {rooms.length} phòng thuộc {ownerHotelIds.length} khách sạn.</div>}
			</Card.Body></Card>
			<Modal show={Boolean(selectedEvent)} onHide={() => setSelectedEvent(null)} centered size={selectedEvent?.type === "booking" ? "lg" : undefined} className="owner-calendar-modal owner-layout-modal">
				<Modal.Header closeButton className={selectedEvent?.type === "booking" ? "owner-calendar-modal-header" : ""}>
					<div>
						<div className="owner-calendar-modal-eyebrow">{selectedEvent?.type === "booking" ? "THÔNG TIN ĐẶT PHÒNG" : "LỊCH KHẢ DỤNG"}</div>
						<Modal.Title>{selectedEvent?.type === "booking" ? "Chi tiết booking" : "Chi tiết khoảng chặn"}</Modal.Title>
						{selectedEvent?.type === "booking" && <div className="owner-calendar-modal-subtitle">{selectedHotelName}</div>}
					</div>
				</Modal.Header>
				<Modal.Body>
					{selectedEvent?.type === "booking" && bookingDetailsQuery.isLoading ? <p className="mb-0">Đang tải chi tiết booking...</p> : selectedEvent?.type === "booking" && bookingDetailsQuery.isError ? <Alert variant="warning">Không thể tải đầy đủ booking từ máy chủ. Một số thông tin lịch vẫn được hiển thị.</Alert> : null}
					{selectedEvent?.type === "booking" && selectedBooking && <>
						<div className="owner-calendar-booking-summary">
							<div className="owner-calendar-booking-code"><span>Mã đặt phòng</span><strong>{getValue(selectedBooking, "maDatPhong") ?? getValue(selectedEvent.item, "maDatPhong") ?? getValue(selectedBooking, "id", "bookingId") ?? selectedEvent.id}</strong></div>
							<span className={`owner-calendar-status owner-calendar-status-${String(bookingStatus ?? "").toLowerCase()}`}>{bookingStatusLabel}</span>
						</div>
						<div className="owner-calendar-info-grid">
							<div className="owner-calendar-info-card"><FontAwesomeIcon icon={faUser} /><div><span>Khách hàng</span><strong>{getValue(selectedBooking, "tenKhachHang", "hoTen") ?? getValue(bookingCustomer, "tenKhachHang", "hoTen", "fullName", "name") ?? "Chưa có thông tin"}</strong><small>{[getValue(selectedBooking, "email") ?? getValue(bookingCustomer, "email"), getValue(selectedBooking, "soDienThoai", "phone") ?? getValue(bookingCustomer, "soDienThoai", "phone")].filter(Boolean).join(" · ") || "Không có thông tin liên hệ"}</small></div></div>
							<div className="owner-calendar-info-card"><FontAwesomeIcon icon={faHotel} /><div><span>Khách sạn</span><strong>{selectedHotelName}</strong></div></div>
							<div className="owner-calendar-info-card"><FontAwesomeIcon icon={faCalendarDays} /><div><span>Ngày lưu trú</span><strong>{formatDate(getValue(selectedBooking, "ngayNhan", "ngayNhanPhong", "checkIn"))} – {formatDate(getValue(selectedBooking, "ngayTra", "ngayTraPhong", "checkOut"))}</strong><small>Ngày trả phòng cũng được đánh dấu trên lịch</small></div></div>
							<div className="owner-calendar-info-card"><FontAwesomeIcon icon={faCreditCard} /><div><span>Thanh toán</span><strong>{getValue(selectedBooking, "thanhToan", "paymentMethod") ?? "-"}</strong><small>Ngày tạo: {formatDate(getValue(selectedBooking, "ngayTao", "createdAt"))}</small></div></div>
						</div>
						<div className="owner-calendar-price-strip">
							<div><span>Tiền phòng</span><strong>{formatMoney(getValue(selectedBooking, "tongTien", "totalAmount") ?? bookingAmount)}</strong></div>
							<div><span>Tiền giảm</span><strong>{formatMoney(getValue(selectedBooking, "soTienGiam", "discountAmount"))}</strong></div>
							<div><FontAwesomeIcon icon={faMoneyBillWave} /><span>Ghi chú:</span><strong>{getValue(selectedBooking, "ghiChu", "note") ?? "-"}</strong></div>
						</div>
						<div className="owner-calendar-room-heading"><h6>Phòng trong booking</h6><span>{bookingRooms.length} loại phòng</span></div>
						{bookingRooms.length ? <Table responsive className="owner-calendar-room-table align-middle mb-0">
							<thead><tr><th>Loại phòng</th><th>Giá</th><th>Phòng</th><th>Trạng thái phòng</th></tr></thead>
							<tbody>{bookingRooms.map((detail: any, index: number) => <tr key={String(getValue(detail, "id") ?? index)}>
								<td>{getValue(detail, "tenLoaiPhong", "roomName") ?? "-"}</td>
								<td>{formatMoney(getValue(detail, "gia", "price"))}</td>
								<td>{rows(getValue(detail, "phongs", "rooms")).map((room: any) => getValue(room, "soPhong", "name")).filter(Boolean).join(", ") || "-"}</td>
								<td>{rows(getValue(detail, "phongs", "rooms")).map((room: any) => getValue(room, "trangThai", "status")).filter(Boolean).join(", ") || "-"}</td>
							</tr>)}</tbody>
						</Table> : <p className="text-muted mb-0">Booking chưa có chi tiết phòng trong dữ liệu trả về.</p>}
					</>}
					{selectedEvent?.type === "block" && <div><p><strong>Lý do:</strong> {getValue(selectedEvent.item, "reason") ?? "Đã chặn"}</p><p className="mb-0"><strong>Thời gian:</strong> {formatDate(getValue(selectedEvent.item, "startAt", "ngayBatDau"))} - {formatDate(getValue(selectedEvent.item, "endAt", "ngayKetThuc"))}</p></div>}
				</Modal.Body>
				{selectedEvent?.type === "booking" && <Modal.Footer><Button variant="outline-secondary" onClick={() => setSelectedEvent(null)}>Đóng</Button></Modal.Footer>}
				{selectedEvent?.type === "block" && <Modal.Footer>
					<Button variant="outline-secondary" onClick={() => setSelectedEvent(null)}>Đóng</Button>
					<Button variant="outline-danger" disabled={removeBlock.isPending} onClick={() => removeBlock.mutate(selectedEvent.id)}><FontAwesomeIcon icon={faTrash} className="me-2" />Gỡ chặn</Button>
				</Modal.Footer>}
			</Modal>
			<Modal show={showBlockForm} onHide={() => setShowBlockForm(false)} className="owner-calendar-modal owner-layout-modal">
				<Modal.Header closeButton><Modal.Title>Chặn phòng</Modal.Title></Modal.Header>
				<Modal.Body><Form.Group className="mb-3"><Form.Label>Phòng</Form.Label><Form.Select value={roomId} onChange={(event) => setRoomId(event.target.value)}><option value="">Chọn phòng</option>{rooms.map((room: any) => <option key={String(getValue(room, "id", "roomId", "phongId"))} value={String(getValue(room, "id", "roomId", "phongId"))}>{getValue(room, "name", "tenPhong", "maPhong") ?? "Phòng"}</option>)}</Form.Select></Form.Group>
					<div className="row g-3"><Form.Group className="col-md-6"><Form.Label>Bắt đầu</Form.Label><Form.Control type="date" value={startAt} onChange={(event) => setStartAt(event.target.value)} min={earliestBlockDateText} /></Form.Group><Form.Group className="col-md-6"><Form.Label>Kết thúc</Form.Label><Form.Control type="date" value={endAt} onChange={(event) => setEndAt(event.target.value)} min={startAt || earliestBlockDateText} /></Form.Group></div>
					<Form.Group className="mt-3"><Form.Label>Lý do</Form.Label><Form.Control value={reason} onChange={(event) => setReason(event.target.value)} maxLength={250} /></Form.Group>
					{error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}
				</Modal.Body><Modal.Footer><Button variant="outline-secondary" onClick={() => setShowBlockForm(false)}>Hủy</Button><Button disabled={createBlock.isPending} onClick={submitBlock}>{createBlock.isPending ? "Đang lưu..." : "Tạo khoảng chặn"}</Button></Modal.Footer>
			</Modal>
		</>
	</OwnerPageShell>;
}
