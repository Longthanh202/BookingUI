import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { GetDanhSachKhachSanOwner } from "../../api/khachsan/khachsan.api";
import { createAvailabilityBlock, deleteAvailabilityBlock, getOwnerCalendar } from "../../api/owner.api";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { field, rows } from "../../components/owner/OwnerDataTable";
import { HotelSelector } from "../../components/owner/OwnerSelectors";
import "../../styles/owner/CalendarOwnerPage.css";

const getValue = (item: any, ...keys: string[]) => keys.map((key) => item?.[key] ?? item?.[key.charAt(0).toUpperCase() + key.slice(1)]).find((value) => value !== undefined && value !== null);
const dateOnly = (value: unknown) => value ? new Date(String(value)).toLocaleDateString("en-CA") : "";
const startOfWeek = (date: Date) => {
	const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
	return start;
};
const localIso = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();

export default function CalendarOwnerPage() {
	const client = useQueryClient();
	const [hotelId, setHotelId] = useState("");
	const [week, setWeek] = useState(() => startOfWeek(new Date()));
	const [showBlockForm, setShowBlockForm] = useState(false);
	const [roomId, setRoomId] = useState("");
	const [startAt, setStartAt] = useState("");
	const [endAt, setEndAt] = useState("");
	const [reason, setReason] = useState("");
	const [error, setError] = useState("");
	const earliestBlockDate = new Date();
	earliestBlockDate.setDate(earliestBlockDate.getDate() + 1);
	const earliestBlockDateText = earliestBlockDate.toLocaleDateString("en-CA");
	const hotels = useQuery({ queryKey: ["owner-hotels"], queryFn: () => GetDanhSachKhachSanOwner({ Page: 1, PageSize: 100 }) });
	const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
		const day = new Date(week);
		day.setDate(day.getDate() + index);
		return day;
	}), [week]);
	const from = localIso(days[0]);
	const toDate = new Date(days[6]);
	toDate.setDate(toDate.getDate() + 1);
	const to = localIso(toDate);
	const calendar = useQuery({
		queryKey: ["owner-calendar", hotelId, from, to],
		queryFn: () => getOwnerCalendar(hotelId, from, to),
		enabled: !!hotelId,
	});
	const payload = calendar.data?.data ?? calendar.data ?? {};
	const rooms = rows(getValue(payload, "rooms", "phongs", "roomList"));
	const bookings = rows(getValue(payload, "bookings", "datPhongs", "reservations"));
	const blocks = rows(getValue(payload, "blocks", "availabilityBlocks", "blockedPeriods", "khoangChan"));
	const createBlock = useMutation({
		mutationFn: () => createAvailabilityBlock(roomId, { startAt: new Date(`${startAt}T00:00:00`).toISOString(), endAt: new Date(`${endAt}T00:00:00`).toISOString(), reason }),
		onSuccess: () => {
			setShowBlockForm(false);
			setRoomId(""); setStartAt(""); setEndAt(""); setReason(""); setError("");
			client.invalidateQueries({ queryKey: ["owner-calendar", hotelId] });
		},
		onError: (failure: any) => setError(failure?.response?.data?.message || "Không thể chặn phòng trong khoảng thời gian này."),
	});
	const removeBlock = useMutation({
		mutationFn: deleteAvailabilityBlock,
		onSuccess: () => client.invalidateQueries({ queryKey: ["owner-calendar", hotelId] }),
		onError: (failure: any) => setError(failure?.response?.data?.message || "Không thể gỡ khoảng chặn."),
	});
	const property = rows(hotels.data).find((hotel: any) => String(field(hotel, "id", "khachSanId")) === hotelId);
	const weekLabel = `${days[0].toLocaleDateString("vi-VN", { day: "numeric", month: "short" })} - ${days[6].toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}`;
	const itemsForDay = (room: any, day: Date) => {
		const roomKey = String(getValue(room, "id", "roomId", "phongId"));
		const selectedDate = dateOnly(day);
		const roomMatches = (item: any) => String(getValue(item, "roomId", "phongId") ?? getValue(getValue(item, "room", "phong"), "id", "roomId", "phongId")) === roomKey;
		const coversDate = (item: any) => {
			const start = dateOnly(getValue(item, "startAt", "checkIn", "ngayNhanPhong", "ngayBatDau"));
			const end = dateOnly(getValue(item, "endAt", "checkOut", "ngayTraPhong", "ngayKetThuc"));
			return start && end && selectedDate >= start && selectedDate < end;
		};
		return [
			...bookings.filter((item) => roomMatches(item) && coversDate(item)).map((item) => ({ item, type: "booking" })),
			...blocks.filter((item) => roomMatches(item) && coversDate(item)).map((item) => ({ item, type: "block" })),
		];
	};
	const submitBlock = () => {
		if (!roomId || !startAt || !endAt || !reason.trim() || startAt < earliestBlockDateText || endAt <= startAt) {
			setError("Chọn phòng, lý do và khoảng thời gian trong tương lai hợp lệ.");
			return;
		}
		createBlock.mutate();
	};

	return <OwnerPageShell title="Lịch phòng" description="Theo dõi booking và khoảng thời gian bị chặn theo từng property.">
		<>
			<div className="mb-3" style={{ maxWidth: 420 }}><HotelSelector data={hotels.data} value={hotelId} onChange={setHotelId} /></div>
			<Card className="owner-panel"><Card.Body>
				<div className="owner-toolbar px-0 pt-0"><div><h5>{property ? field(property, "tenKhachSan", "name") : "Lịch availability"}</h5><span>{weekLabel}</span></div><div className="d-flex gap-2"><Button variant="outline-dark" onClick={() => setWeek(startOfWeek(new Date()))}>Hôm nay</Button><Button variant="outline-dark" title="Tuần trước" aria-label="Tuần trước" onClick={() => setWeek((current) => new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7))}><FontAwesomeIcon icon={faChevronLeft} /></Button><Button variant="outline-dark" title="Tuần sau" aria-label="Tuần sau" onClick={() => setWeek((current) => new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7))}><FontAwesomeIcon icon={faChevronRight} /></Button><Button variant="dark" disabled={!hotelId} onClick={() => { setError(""); setShowBlockForm(true); }}><FontAwesomeIcon icon={faPlus} /> Chặn ngày</Button></div></div>
				{error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
				{!hotelId ? <p className="text-muted mb-0">Chọn property để xem lịch.</p> : calendar.isLoading ? <p className="text-muted mb-0">Đang tải lịch...</p> : calendar.isError ? <Alert variant="danger">Không thể tải lịch property.</Alert> : <div className="calendar-grid">
					<div className="calendar-header"><span>Phòng</span>{days.map((day) => <strong key={day.toISOString()}>{day.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" })}</strong>)}</div>
					{rooms.map((room: any) => <div className="calendar-row" key={String(getValue(room, "id", "roomId", "phongId"))}><span>{getValue(room, "name", "tenPhong", "maPhong") ?? "Phòng"}</span>{days.map((day) => {
						const dayItems = itemsForDay(room, day);
						return <div key={day.toISOString()} className={`calendar-cell ${dayItems.length ? (dayItems[0].type === "block" ? "blocked" : "booked") : "available"}`} title={dayItems.map(({ item }) => getValue(item, "reason", "tenKhachHang", "guestName", "status") ?? "").join(", ")}>
							{dayItems.map(({ item, type }) => <span className="d-block" key={String(getValue(item, "id", "bookingId", "blockId"))}>{type === "block" ? getValue(item, "reason") ?? "Đã chặn" : getValue(item, "tenKhachHang", "guestName", "status") ?? "Đã đặt"}{type === "block" && <Button variant="link" size="sm" title="Gỡ chặn" aria-label="Gỡ chặn" onClick={() => removeBlock.mutate(String(getValue(item, "id", "blockId")))}><FontAwesomeIcon icon={faTrash} /></Button>}</span>)}
						</div>;
					})}</div>)}
					{!rooms.length && <p className="text-muted mt-3 mb-0">Property chưa có phòng để hiển thị.</p>}
				</div>}
			</Card.Body></Card>
			<Modal show={showBlockForm} onHide={() => setShowBlockForm(false)}>
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
