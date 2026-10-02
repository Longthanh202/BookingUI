import { Alert, Card } from "react-bootstrap";
import OwnerPageShell from "../../components/owner/OwnerPageShell";

export default function StaffOwnerPage() {
  return (
    <OwnerPageShell title="Đội ngũ nhân sự" description="Quản lý nhân sự theo khách sạn.">
      <Card className="owner-panel">
        <Card.Body>
          <Alert variant="info" className="mb-0">
            Backend hiện chưa cung cấp API quản lý nhân sự theo phạm vi khách sạn; chức năng này chưa khả dụng.
          </Alert>
        </Card.Body>
      </Card>
    </OwnerPageShell>
  );
}
