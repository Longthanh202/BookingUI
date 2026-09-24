import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, Badge, Button, Card, Form, Table } from "react-bootstrap";
import { searchBookingsAdmin } from "../../api/booking/booking.api";
import { getAdminPayments, updatePaymentStatus } from "../../api/payment/payment.api";
import { getPendingCommissions } from "../../api/hoahong/hoahong.api";
import { getPendingWithdrawals, updateWithdrawal } from "../../api/finance/finance.api";
import { getPendingAdvertising, approveAdvertising } from "../../api/advertising/advertising.api";
import { getBanners, updateBanner, deleteBanner } from "../../api/banner/banner.api";
import { searchHotelsAdmin, updateHotelStatus } from "../../api/khachsan/khachsan.api";

const rows = (data: any): any[] => Array.isArray(data) ? data : data?.data || data?.items || data?.results || [];
const headings: Record<string, string> = { bookings: "Tìm kiếm booking", payments: "Thanh toán", commissions: "Hoa hồng chờ thu", withdrawals: "Yêu cầu rút tiền", advertising: "Chiến dịch chờ duyệt", banners: "Quản lý banner", hotels: "Duyệt property" };

export default function AdminOperationsPage() {
  const section = useLocation().pathname.split("/").filter(Boolean).pop() || "bookings";
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const set = (key: string, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const request = (promise: Promise<any>) => promise.then(() => setNotice("Đã cập nhật thành công.")).catch((error) => setNotice(error?.response?.data?.message || "Không thể hoàn tất thao tác."));
  const query = useQuery({ queryKey: ["admin", section, filters], queryFn: () => {
    if (section === "bookings") return searchBookingsAdmin({ hotelId: filters.hotelId, customerId: filters.customerId, trangThai: filters.trangThai, ngayTao: filters.ngayTao, page: 1, pageSize: 20 });
    if (section === "payments") return getAdminPayments();
    if (section === "commissions") return getPendingCommissions();
    if (section === "withdrawals") return getPendingWithdrawals();
    if (section === "advertising") return getPendingAdvertising();
    if (section === "banners") return getBanners({ keyword: filters.keyword, isActive: filters.isActive ? Number(filters.isActive) : undefined, startRow: 0, endRow: 50 });
    return searchHotelsAdmin({ keyword: filters.keyword, trangThai: filters.trangThai });
  } });
  const data = rows(query.data);
  return <div className="container-fluid py-2"><div className="mb-4"><div className="text-uppercase text-muted small">Admin console</div><h2>{headings[section] || "Quản trị Stayro"}</h2><p className="text-muted">Quản lý dữ liệu và phê duyệt theo quyền Admin.</p></div>{notice && <Alert variant={notice.includes("thành công") ? "success" : "danger"} dismissible onClose={() => setNotice("")}>{notice}</Alert>}<Card className="mb-3"><Card.Body><div className="row g-2">{section === "bookings" && <><Input label="Hotel ID" value={filters.hotelId} onChange={(v) => set("hotelId", v)} /><Input label="Customer ID" value={filters.customerId} onChange={(v) => set("customerId", v)} /><Input label="Trạng thái" value={filters.trangThai} onChange={(v) => set("trangThai", v)} /><Input label="Ngày tạo" type="datetime-local" value={filters.ngayTao} onChange={(v) => set("ngayTao", v)} /></>}{(section === "banners" || section === "hotels") && <Input label="Từ khóa" value={filters.keyword} onChange={(v) => set("keyword", v)} />}{section === "banners" && <Input label="Active (1/0)" value={filters.isActive} onChange={(v) => set("isActive", v)} />} {(section === "hotels") && <Input label="Trạng thái" value={filters.trangThai} onChange={(v) => set("trangThai", v)} />}</div></Card.Body></Card><Card><Card.Body><Table responsive hover><thead><tr><th>ID</th><th>Thông tin</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{data.map((item: any, index) => <AdminRow key={item.id || item.Id || index} item={item} section={section} onAction={request} />)}</tbody></Table>{!query.isLoading && data.length === 0 && <div className="text-center text-muted py-4">Chưa có dữ liệu phù hợp.</div>}</Card.Body></Card></div>;
}
function AdminRow({ item, section, onAction }: { item: any; section: string; onAction: (promise: Promise<any>) => void }) { const id = item.id || item.Id; const status = item.trangThai || item.TrangThai || item.status || item.Status || "-"; const label = item.tenKhachSan || item.khachSanTen || item.title || item.username || item.maGiaoDich || item.email || item.noiDung || "Bản ghi"; const action = section === "payments" ? <Button size="sm" onClick={() => onAction(updatePaymentStatus(id, "DA_THANH_TOAN"))}>Đã thanh toán</Button> : section === "withdrawals" ? <Button size="sm" onClick={() => onAction(updateWithdrawal(id, { trangThai: "DA_CHI_TRA", ghiChu: "Đã xử lý trên admin" }))}>Đã chi trả</Button> : section === "advertising" ? <><Button size="sm" className="me-1" onClick={() => onAction(approveAdvertising(id, true))}>Duyệt</Button><Button size="sm" variant="outline-danger" onClick={() => onAction(approveAdvertising(id, false, "Không đạt điều kiện"))}>Từ chối</Button></> : section === "banners" ? <><Button size="sm" className="me-1" onClick={() => onAction(updateBanner(id, { title: item.title || item.Title || "", subtitle: item.subtitle || item.Subtitle || "", url: item.url || item.Url || "", isActive: item.isActive ? 0 : 1 }))}>Bật/tắt</Button><Button size="sm" variant="outline-danger" onClick={() => onAction(deleteBanner(id))}>Xóa</Button></> : section === "hotels" ? <Button size="sm" onClick={() => onAction(updateHotelStatus(id, "DA_DUYET"))}>Duyệt</Button> : null; return <tr><td><code>{String(id || indexOf(item))}</code></td><td><strong>{String(label)}</strong><div className="small text-muted">{item.soTien ? `${Number(item.soTien).toLocaleString("vi-VN")} đ` : item.ngayTao || item.createdAt || ""}</div></td><td><Badge bg="secondary">{String(status)}</Badge></td><td>{action || "-"}</td></tr>; }
function Input({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (value: string) => void; type?: string }) { return <div className="col-md-3"><Form.Label>{label}</Form.Label><Form.Control type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>; }
function indexOf(item: any) { return item.index || "-"; }
