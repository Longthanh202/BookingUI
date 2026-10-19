import { useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../../components/common/SystemModal";
import NumberedPagination from "../../components/common/NumberedPagination";
import {
  approveOwnerRegistration,
  OwnerRegistration,
  rejectOwnerRegistration,
  searchOwnerRegistrations,
} from "../../api/admin/admin.api";
import "../../styles/layouts/AdminLayout.css";

const statusLabels = ["Chờ duyệt", "Đã duyệt", "Đã từ chối"];

const OwnerRegistrationsPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRegistration, setSelectedRegistration] = useState<OwnerRegistration | null>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<{ variant: "success" | "danger"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const registrations = useQuery({
    queryKey: ["admin", "owner-registrations", { status, keyword, page, pageSize }],
    queryFn: () => searchOwnerRegistrations({
      status: status === "" ? undefined : Number(status) as 0 | 1 | 2,
      keyword: keyword || undefined,
      page,
      pageSize,
    }),
  });

  const handleAction = async (operation: () => Promise<unknown>, successText: string) => {
    setSaving(true);
    setNotice(null);
    try {
      await operation();
      setNotice({ variant: "success", text: successText });
      setSelectedRegistration(null);
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "owner-registrations"] });
    } catch (error: any) {
      setNotice({ variant: "danger", text: error?.response?.data?.message || error?.response?.data?.Message || error?.message || "Không thể xử lý hồ sơ." });
    } finally {
      setSaving(false);
    }
  };

  const reject = () => {
    if (!selectedRegistration || !reason.trim() || reason.trim().length > 500) {
      setNotice({ variant: "danger", text: "Lý do từ chối là bắt buộc và tối đa 500 ký tự." });
      return;
    }
    void handleAction(
      () => rejectOwnerRegistration(selectedRegistration.userId, reason.trim()),
      "Đã từ chối hồ sơ và đưa email thông báo vào hàng đợi.",
    );
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setKeyword(keywordDraft.trim());
    setPage(1);
  };

  return <div>
    <div className="admin-page-intro">
      <div><span className="admin-kicker">Quản trị Stayro</span><h2>Hồ sơ đăng ký Owner</h2><p>Xem thông tin đối tác và xử lý các hồ sơ đang chờ duyệt.</p></div>
      <Button variant="outline-secondary" size="sm" onClick={() => void registrations.refetch()} disabled={registrations.isFetching}>Làm mới</Button>
    </div>
    {notice && <Alert className="admin-alert" variant={notice.variant} dismissible onClose={() => setNotice(null)}>{notice.text}</Alert>}
    {registrations.isError && <Alert className="admin-alert" variant="danger">Không tải được hồ sơ Owner. Hãy kiểm tra kết nối API và quyền Admin.</Alert>}
    <section className="admin-panel admin-filter-panel">
      <div className="admin-panel-heading"><div><h3>Bộ lọc</h3><p>Tìm hồ sơ theo từ khóa và trạng thái duyệt.</p></div></div>
      <div className="admin-panel-body">
        <Form onSubmit={applyFilters} className="admin-filter-grid">
          <div><Form.Label>Từ khóa</Form.Label><Form.Control value={keywordDraft} onChange={(event) => setKeywordDraft(event.target.value)} placeholder="Username, tên, email hoặc điện thoại" /></div>
          <div><Form.Label>Trạng thái duyệt</Form.Label><Form.Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option>{statusLabels.map((label, value) => <option key={value} value={value}>{label}</option>)}</Form.Select></div>
          <div><Form.Label>Số dòng</Form.Label><Form.Select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={10}>10 / trang</option><option value={20}>20 / trang</option><option value={50}>50 / trang</option><option value={100}>100 / trang</option></Form.Select></div>
          <div className="admin-filter-submit"><Button type="submit">Áp dụng</Button></div>
        </Form>
      </div>
    </section>
    <section className="admin-panel admin-results-panel">
      <div className="admin-panel-heading"><div><h3>Kết quả</h3><p>{registrations.isLoading ? "Đang tải hồ sơ..." : `${registrations.data?.totalRow ?? 0} hồ sơ`}</p></div></div>
      <div className="admin-table-wrap"><Table className="admin-table" hover>
        <thead><tr><th>Tài khoản</th><th>Thông tin liên hệ</th><th>Ngân hàng</th><th>Trạng thái</th><th>Ghi chú</th><th className="text-end">Thao tác</th></tr></thead>
        <tbody>
          {(registrations.data?.data ?? []).map((item) => <tr key={item.userId}>
            <td><span className="admin-primary-cell">{item.fullName}</span><span className="admin-secondary-cell">{item.username} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "—"}</span></td>
            <td>{item.email}<span className="admin-secondary-cell">{item.phone} · {item.address}</span></td>
            <td>{item.bankAccount ? <><span className="admin-primary-cell">{item.bankAccount.bankName}</span><span className="admin-secondary-cell">{item.bankAccount.accountNumber} · {item.bankAccount.accountHolder}{item.bankAccount.branch ? ` · ${item.bankAccount.branch}` : ""}</span></> : "—"}</td>
            <td><span className={`admin-status-badge ${item.approvalStatus === 0 ? "is-warning" : item.approvalStatus === 1 ? "is-positive" : "is-negative"}`}>{statusLabels[item.approvalStatus] ?? "Không xác định"}</span>{item.reviewedAt && <span className="admin-secondary-cell">Xử lý: {new Date(item.reviewedAt).toLocaleDateString("vi-VN")}</span>}</td>
            <td>{item.reviewNote || "—"}</td>
            <td><div className="admin-action-group justify-content-end">
              {item.approvalStatus === 0 ? <>
                <Button size="sm" disabled={saving} onClick={() => void handleAction(() => approveOwnerRegistration(item.userId), "Đã duyệt hồ sơ Owner.")}>Duyệt</Button>
                <Button size="sm" variant="outline-danger" disabled={saving} onClick={() => { setSelectedRegistration(item); setReason(""); setNotice(null); }}>Từ chối</Button>
              </> : "—"}
            </div></td>
          </tr>)}
        </tbody>
      </Table></div>
      {registrations.isLoading && <div className="admin-empty">Đang tải hồ sơ...</div>}
      {!registrations.isLoading && registrations.data?.data.length === 0 && <div className="admin-empty">Không có hồ sơ phù hợp.</div>}
    </section>
    <NumberedPagination page={page} totalPages={Math.max(1, registrations.data?.totalPage ?? 1)} disabled={registrations.isFetching} className="admin-pagination" onPageChange={setPage} />
    <Modal show={Boolean(selectedRegistration)} onHide={() => setSelectedRegistration(null)} centered>
      <Modal.Header closeButton><Modal.Title>Từ chối hồ sơ Owner</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>Nhập lý do từ chối hồ sơ của {selectedRegistration?.fullName}.</p>
        <Form.Control as="textarea" rows={4} maxLength={500} required value={reason} onChange={(event) => setReason(event.target.value)} aria-label="Lý do từ chối" />
        <small className="text-muted">{reason.length}/500 ký tự</small>
      </Modal.Body>
      <Modal.Footer><Button variant="outline-secondary" onClick={() => setSelectedRegistration(null)}>Hủy</Button><Button variant="danger" disabled={saving || !reason.trim()} onClick={reject}>{saving ? "Đang xử lý..." : "Xác nhận từ chối"}</Button></Modal.Footer>
    </Modal>
  </div>;
};

export default OwnerRegistrationsPage;
