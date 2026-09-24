import { useState } from "react";
import { Badge, Card, Form, Table } from "react-bootstrap";
import OwnerPageShell from "../../components/owner/OwnerPageShell";

export default function StaffOwnerPage() {
	const [search, setSearch] = useState(""); const staff = [{ name: "Owner hiện tại", email: "-", role: "Quản lý property", status: "Đang hoạt động" }].filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
	return <OwnerPageShell title="Đội ngũ nhân sự" description="Phân quyền nhân viên theo property và vai trò vận hành"><Card className="owner-panel"><Card.Body><div className="owner-toolbar px-0 pt-0"><div><h5>Danh sách nhân sự</h5><span>Nhân sự được cấp quyền trong owner account</span></div><Form.Control className="w-auto" placeholder="Tìm nhân sự" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Table responsive className="owner-table align-middle"><thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th></tr></thead><tbody>{staff.map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.email}</td><td>{row.role}</td><td><Badge bg="success">{row.status}</Badge></td></tr>)}</tbody></Table></Card.Body></Card></OwnerPageShell>;
}
