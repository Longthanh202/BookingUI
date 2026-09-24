import { Button, Card, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faEllipsis, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import OwnerPageShell from "../../components/owner/OwnerPageShell";

export default function NotificationOwnerPage() {
	const notifications = ["Booking mới từ hệ thống", "Property đã được cập nhật", "Bạn nhận được review mới"];
	return <OwnerPageShell title="Thông báo" description="Các cập nhật quan trọng về booking, thanh toán và property"><Row className="g-4">{notifications.map((item, index) => <Col md={6} xl={4} key={item}><Card className="owner-list-card h-100"><Card.Body><div className="d-flex justify-content-between"><span className={`owner-list-icon icon-${index % 3}`}><FontAwesomeIcon icon={faCircleExclamation} /></span><FontAwesomeIcon icon={faEllipsis} className="text-muted" /></div><h5>{item}</h5><p>Cập nhật từ hệ thống</p><Button variant="link" className="px-0">Xem chi tiết <FontAwesomeIcon icon={faChevronRight} /></Button></Card.Body></Card></Col>)}</Row></OwnerPageShell>;
}
