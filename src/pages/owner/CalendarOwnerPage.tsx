import { Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { roomRows } from "../../components/owner/OwnerWorkspaceData";

export default function CalendarOwnerPage() {
	return <OwnerPageShell title="Lịch phòng" description="Theo dõi công suất theo ngày và đánh dấu thời gian không khả dụng"><Card className="owner-panel"><Card.Body><div className="owner-toolbar px-0 pt-0"><div><h5>Lịch availability</h5><span>Tuần 21 - 27 tháng 09, 2026</span></div><div className="d-flex gap-2"><Button variant="outline-dark">Hôm nay</Button><Button variant="dark"><FontAwesomeIcon icon={faPlus} /> Chặn ngày</Button></div></div><div className="calendar-grid"><div className="calendar-header"><span>Resource</span>{["T2 21", "T3 22", "T4 23", "T5 24", "T6 25", "T7 26", "CN 27"].map((day) => <strong key={day}>{day}</strong>)}</div>{roomRows.map((room, index) => <div className="calendar-row" key={room.room}><span>{room.room}</span>{[0, 1, 2, 3, 4, 5, 6].map((day) => <div key={day} className={`calendar-cell ${day === index + 1 || (index === 0 && day > 4) ? "booked" : "available"}`}>{day === index + 1 ? "Đã đặt" : ""}</div>)}</div>)}</div></Card.Body></Card></OwnerPageShell>;
}
