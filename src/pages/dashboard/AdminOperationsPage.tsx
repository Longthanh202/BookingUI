import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Form, Modal, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faRotate, faPen, faTrash, faCheck, faBan, faLockOpen, faLock } from "@fortawesome/free-solid-svg-icons";
import { searchBookingsAdmin } from "../../api/booking/booking.api";
import { getAdminPayments, updatePaymentStatus } from "../../api/payment/payment.api";
import { getPendingCommissions } from "../../api/hoahong/hoahong.api";
import { getPendingWithdrawals, updateWithdrawal } from "../../api/finance/finance.api";
import { getPendingAdvertising, approveAdvertising } from "../../api/advertising/advertising.api";
import { createBanner, getBanners, updateBanner, deleteBanner } from "../../api/banner/banner.api";
import { searchHotelsAdmin, updateHotelStatus } from "../../api/khachsan/khachsan.api";
import { deleteReview } from "../../api/review/review.api";
import { createAdminTag, disableAdminTag, getAdminTags, replaceAdminTagHotels, searchAdminUsers, updateAdminTag, updateAdminUserStatus } from "../../api/admin/admin.api";
import { setRolePermissions } from "../../api/auth/auth.api";

type AdminRowData = Record<string, any>;
type ConfirmAction = { title: string; description: string; operation?: () => Promise<any>; kind?: "withdrawal" | "advertising-rejection"; id?: string; status?: string };
type Notice = { kind: "success" | "danger"; text: string };

const hotelStatuses = ["CHO_DUYET", "DA_DUYET", "TAM_NGUNG", "TU_CHOI", "DA_KHOA"];
const paymentStatuses = ["CHO_THANH_TOAN", "DA_THANH_TOAN", "DA_HUY", "DA_HOAN_TIEN"];

const titles: Record<string, string> = {
  bookings: "Đặt phòng toàn hệ thống", payments: "Thanh toán", commissions: "Hoa hồng chờ xử lý",
  withdrawals: "Yêu cầu rút tiền", advertising: "Duyệt quảng cáo", banners: "Quản lý banner",
  hotels: "Quản lý khách sạn", users: "Tài khoản người dùng", reviews: "Xử lý đánh giá vi phạm",
  tags: "Tags và tab khám phá", permissions: "Phân quyền theo role",
};

const rows = (value: any): AdminRowData[] => {
  const data = value?.data ?? value;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const field = (item: AdminRowData, ...keys: string[]) => keys.map((key) => item?.[key]).find((value) => value !== undefined && value !== null && value !== "");

const statusClass = (value: unknown) => {
  const status = String(value ?? "").toLowerCase();
  if (["true", "1", "da_duyet", "da_thanh_toan", "da_chi_tra", "hoat_dong", "active", "approved", "paid"].some((part) => status.includes(part))) return "is-positive";
  if (["tu_choi", "huy", "that_bai", "khoa", "inactive", "rejected", "failed"].some((part) => status.includes(part))) return "is-negative";
  if (["cho", "pending", "dang_xu_ly", "0"].some((part) => status.includes(part))) return "is-warning";
  return "";
};

export default function AdminOperationsPage() {
  const section = useLocation().pathname.split("/").filter(Boolean).pop() || "bookings";
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Record<string, string>>({ page: "1", pageSize: "20" });
  const [filterDraft, setFilterDraft] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [reviewId, setReviewId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [permissionsText, setPermissionsText] = useState("");
  const [bannerDraft, setBannerDraft] = useState({ title: "", subtitle: "", isActive: "1", file: null as File | null });
  const [editingBanner, setEditingBanner] = useState<AdminRowData | null>(null);
  const [bannerEditDraft, setBannerEditDraft] = useState({ title: "", subtitle: "", url: "", isActive: "1" });
  const [selectedTagId, setSelectedTagId] = useState("");
  const [tagDraft, setTagDraft] = useState({ name: "", slug: "", description: "", sortOrder: "0", isActive: true, hotelIds: "" });

  const query = useQuery({
    queryKey: ["admin", section, filters],
    queryFn: () => {
      const page = Number(filters.page || 1);
      const pageSize = Number(filters.pageSize || 20);
      if (section === "bookings") return searchBookingsAdmin({ hotelId: filters.hotelId || null, customerId: filters.customerId || null, trangThai: filters.trangThai || null, ngayTao: filters.ngayTao ? new Date(filters.ngayTao).toISOString() : null, page, pageSize });
      if (section === "payments") return getAdminPayments();
      if (section === "commissions") return getPendingCommissions();
      if (section === "withdrawals") return getPendingWithdrawals();
      if (section === "advertising") return getPendingAdvertising();
      if (section === "banners") return getBanners({ keyword: filters.keyword || undefined, isActive: filters.isActive === "1" ? 1 : undefined, startRow: (page - 1) * pageSize, endRow: page * pageSize });
      if (section === "hotels") return searchHotelsAdmin({ keyword: filters.keyword || undefined, thanhPho: filters.thanhPho || undefined, soSao: filters.soSao ? Number(filters.soSao) : undefined, trangThai: filters.trangThai || undefined, page, pageSize });
      if (section === "users") return searchAdminUsers({ keyword: filters.keyword || undefined, status: filters.status === "" || filters.status === undefined ? undefined : Number(filters.status), page, pageSize });
      if (section === "tags") return getAdminTags();
      return Promise.resolve([]);
    },
  });

  const data = rows(query.data);
  const responseData = query.data?.data ?? query.data;
  const total = Number(query.data?.totalRow ?? query.data?.totalCount ?? query.data?.totalItems ?? query.data?.total ?? query.data?.count ?? responseData?.totalRow ?? responseData?.totalCount ?? responseData?.totalItems ?? responseData?.total ?? responseData?.count ?? data.length);
  const page = Number(filters.page || 1);
  const pageSize = Number(filters.pageSize || 20);
  const totalPage = Number(query.data?.totalPage ?? responseData?.totalPage ?? 0);
  const hasNextPage = totalPage > 0 ? page < totalPage : total > page * pageSize || data.length === pageSize;

  const request = async (operation: () => Promise<any>): Promise<boolean> => {
    setSaving(true);
    try {
      await operation();
      setNotice({ kind: "success", text: "Đã cập nhật thành công." });
      await queryClient.invalidateQueries({ queryKey: ["admin", section] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "advertising"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "commissions"] });
      return true;
    } catch (error: any) {
      setNotice({ kind: "danger", text: error?.response?.data?.message || error?.message || "Không thể hoàn tất thao tác." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitFilters = (event: React.FormEvent) => {
    event.preventDefault();
    if (section === "hotels" && filterDraft.soSao && (!Number.isInteger(Number(filterDraft.soSao)) || Number(filterDraft.soSao) < 1 || Number(filterDraft.soSao) > 5)) {
      setNotice({ kind: "danger", text: "Số sao phải từ 1 đến 5; để trống nếu không lọc." });
      return;
    }
    setFilters((current) => ({ ...current, ...filterDraft, page: "1" }));
  };

  const askForConfirmation = (action: ConfirmAction) => {
    setActionNote("");
    setTransactionRef("");
    setConfirmAction(action);
  };

  const executeConfirmed = async () => {
    if (!confirmAction) return;
    if (confirmAction.kind === "advertising-rejection" && !actionNote.trim()) {
      setNotice({ kind: "danger", text: "Vui lòng nhập lý do từ chối chiến dịch." });
      return;
    }
    const operation = confirmAction.kind === "withdrawal"
      ? () => updateWithdrawal(confirmAction.id as string, { trangThai: confirmAction.status as string, maGiaoDich: transactionRef.trim() || null, ghiChu: actionNote.trim() || null })
      : confirmAction.kind === "advertising-rejection"
        ? () => approveAdvertising(confirmAction.id as string, false, actionNote.trim())
        : confirmAction.operation;
    if (!operation) return;
    const succeeded = await request(operation);
    if (succeeded) setConfirmAction(null);
  };

  const resetTagDraft = () => {
    setSelectedTagId("");
    setTagDraft({ name: "", slug: "", description: "", sortOrder: "0", isActive: true, hotelIds: "" });
  };

  const saveTag = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { name: tagDraft.name.trim(), slug: tagDraft.slug.trim(), description: tagDraft.description.trim(), sortOrder: Number(tagDraft.sortOrder) || 0, isActive: tagDraft.isActive };
    if (!payload.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
      setNotice({ kind: "danger", text: "Tên tag và slug ASCII chữ thường dạng da-lat là bắt buộc." });
      return;
    }
    const succeeded = await request(() => selectedTagId ? updateAdminTag(selectedTagId, payload) : createAdminTag(payload));
    if (succeeded) resetTagDraft();
  };

  const openBannerEditor = (banner: AdminRowData) => {
    setEditingBanner(banner);
    setBannerEditDraft({
      title: String(field(banner, "title", "Title") ?? ""),
      subtitle: String(field(banner, "subtitle", "Subtitle") ?? ""),
      url: String(field(banner, "url", "Url") ?? ""),
      isActive: String(Number(field(banner, "isActive", "IsActive") ?? 0)),
    });
  };

  const saveBanner = async () => {
    if (!editingBanner) return;
    const id = field(editingBanner, "id", "Id");
    const succeeded = await request(() => updateBanner(String(id), { ...bannerEditDraft, isActive: Number(bannerEditDraft.isActive) }));
    if (succeeded) setEditingBanner(null);
  };

  const saveBannerCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bannerDraft.file || !bannerDraft.title.trim()) return;
    const succeeded = await request(() => createBanner({ Title: bannerDraft.title.trim(), Subtitle: bannerDraft.subtitle.trim(), IsActive: Number(bannerDraft.isActive), File: bannerDraft.file as File }));
    if (succeeded) setBannerDraft({ title: "", subtitle: "", isActive: "1", file: null });
  };

  const savePermissions = async (event: React.FormEvent) => {
    event.preventDefault();
    let permissions: Record<string, unknown>[];
    try {
      const parsed: unknown = JSON.parse(permissionsText);
      if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
        throw new Error("Permissions phải là một mảng DTO JSON không rỗng.");
      }
      permissions = parsed as Record<string, unknown>[];
    } catch (error) {
      setNotice({ kind: "danger", text: error instanceof Error ? error.message : "Permissions phải là JSON hợp lệ." });
      return;
    }
    if (!roleId.trim()) return;
    await request(() => setRolePermissions({ roleId: roleId.trim(), permissions }));
  };

  return <div>
    <div className="admin-page-intro">
      <div><span className="admin-kicker">Quản trị Stayro</span><h2>{titles[section] || "Quản trị dữ liệu"}</h2><p>Tra cứu và xử lý dữ liệu theo quyền quản trị toàn hệ thống.</p></div>
      {section !== "reviews" && section !== "permissions" && <Button variant="outline-secondary" size="sm" onClick={() => void query.refetch()} disabled={query.isFetching}><FontAwesomeIcon icon={faRotate} className="me-2" />Làm mới</Button>}
    </div>

    {notice && <Alert className="admin-alert" variant={notice.kind} dismissible onClose={() => setNotice(null)}>{notice.text}</Alert>}
    {query.isError && <Alert className="admin-alert" variant="danger">Không tải được dữ liệu. Hãy kiểm tra kết nối API và quyền Admin.</Alert>}

    {section === "reviews" && <section className="admin-panel">
      <div className="admin-panel-heading"><div><h3>Xóa đánh giá vi phạm</h3><p>API hiện có hỗ trợ xóa theo ID; chưa có endpoint danh sách review dành cho Admin.</p></div></div>
      <div className="admin-panel-body"><Form onSubmit={(event) => { event.preventDefault(); if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reviewId.trim())) { setNotice({ kind: "danger", text: "Review ID phải là UUID hợp lệ." }); return; } askForConfirmation({ title: "Xóa đánh giá", description: `Đánh giá ${reviewId.trim()} sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác.` , operation: () => deleteReview(reviewId.trim()) }); }} className="admin-inline-form">
        <Form.Control aria-label="Review ID" placeholder="Nhập review UUID" value={reviewId} onChange={(event) => setReviewId(event.target.value)} />
        <Button variant="danger" type="submit" disabled={!reviewId.trim()}><FontAwesomeIcon icon={faTrash} className="me-2" />Xóa đánh giá</Button>
      </Form></div>
    </section>}

    {section === "permissions" && <section className="admin-panel">
      <div className="admin-panel-heading"><div><h3>Gán permissions cho role</h3><p>Gửi roleId cùng danh sách permission lên API.</p></div></div>
      <div className="admin-panel-body"><Form onSubmit={savePermissions} className="admin-permission-form">
        <div><Form.Label>Role ID</Form.Label><Form.Control required value={roleId} onChange={(event) => setRoleId(event.target.value)} placeholder="Role ID" /></div>
        <div><Form.Label>RolePermissionDto[] (JSON)</Form.Label><Form.Control required as="textarea" rows={7} value={permissionsText} onChange={(event) => setPermissionsText(event.target.value)} placeholder={'[{"<dto-field>":"<value>"}]'} /><Form.Text>Nhập mảng JSON theo đúng các trường của RolePermissionDto backend.</Form.Text></div>
        <div><Button type="submit" disabled={saving || !roleId.trim() || !permissionsText.trim()}>Lưu phân quyền</Button></div>
      </Form></div>
    </section>}

    {section === "tags" && <>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>{selectedTagId ? "Chỉnh sửa tag" : "Tạo tag khám phá"}</h3><p>Slug duy nhất, dạng ASCII chữ thường: da-lat.</p></div>{selectedTagId && <Button size="sm" variant="outline-secondary" onClick={resetTagDraft}>Tạo mới</Button>}</div>
        <div className="admin-panel-body"><Form onSubmit={saveTag} className="admin-tag-form">
          <div><Form.Label>Chọn tag để sửa</Form.Label><Form.Select value={selectedTagId} onChange={(event) => { const id = event.target.value; const tag = data.find((item) => String(field(item, "id", "Id")) === id); setSelectedTagId(id); if (tag) { const active = field(tag, "isActive", "IsActive"); setTagDraft({ name: String(field(tag, "name", "Name") ?? ""), slug: String(field(tag, "slug", "Slug") ?? ""), description: String(field(tag, "description", "Description") ?? ""), sortOrder: String(field(tag, "sortOrder", "SortOrder") ?? 0), isActive: Number(active) === 1 || active === true, hotelIds: "" }); } else resetTagDraft(); }}><option value="">Tag mới</option>{data.map((tag) => <option key={String(field(tag, "id", "Id"))} value={String(field(tag, "id", "Id"))}>{String(field(tag, "name", "Name"))} · {String(field(tag, "slug", "Slug"))}</option>)}</Form.Select></div>
          <div><Form.Label>Tên tag</Form.Label><Form.Control required value={tagDraft.name} onChange={(event) => setTagDraft((current) => ({ ...current, name: event.target.value }))} /></div>
          <div><Form.Label>Slug</Form.Label><Form.Control required value={tagDraft.slug} onChange={(event) => setTagDraft((current) => ({ ...current, slug: event.target.value }))} /></div>
          <div><Form.Label>Thứ tự</Form.Label><Form.Control type="number" min="0" value={tagDraft.sortOrder} onChange={(event) => setTagDraft((current) => ({ ...current, sortOrder: event.target.value }))} /></div>
          <div className="admin-tag-description"><Form.Label>Mô tả</Form.Label><Form.Control value={tagDraft.description} onChange={(event) => setTagDraft((current) => ({ ...current, description: event.target.value }))} /></div>
          <div className="admin-tag-toggle"><Form.Check type="switch" label="Đang bật" checked={tagDraft.isActive} onChange={(event) => setTagDraft((current) => ({ ...current, isActive: event.target.checked }))} /></div>
          <div className="admin-tag-actions"><Button type="submit" disabled={saving}>{selectedTagId ? "Lưu thay đổi" : "Tạo tag"}</Button>{selectedTagId && <Button type="button" variant="outline-danger" onClick={() => askForConfirmation({ title: "Tắt tag", description: "Tag sẽ bị tắt mềm; các liên kết khách sạn được giữ nguyên.", operation: () => disableAdminTag(selectedTagId) })}>Tắt tag</Button>}</div>
        </Form></div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>Gán khách sạn vào tag</h3><p>Thao tác này thay thế toàn bộ liên kết hiện tại của tag.</p></div></div>
        <div className="admin-panel-body"><div className="admin-tag-assign">
          <div><Form.Label>Hotel IDs</Form.Label><Form.Control as="textarea" rows={3} value={tagDraft.hotelIds} onChange={(event) => setTagDraft((current) => ({ ...current, hotelIds: event.target.value }))} placeholder="Mỗi ID một dòng hoặc phân cách bằng dấu phẩy" /></div>
          <Button variant="outline-primary" disabled={!selectedTagId || saving} onClick={() => { const hotelIds = tagDraft.hotelIds.split(/[\n,]/).map((id) => id.trim()).filter(Boolean); askForConfirmation({ title: "Thay danh sách khách sạn", description: `Danh sách mới gồm ${hotelIds.length} khách sạn sẽ thay thế toàn bộ liên kết hiện tại.`, operation: () => replaceAdminTagHotels(selectedTagId, hotelIds) }); }}>Thay danh sách khách sạn</Button>
        </div></div>
      </section>
      <DataTable section={section} data={data} loading={query.isLoading} onAction={askForConfirmation} />
    </>}

    {section === "banners" && <section className="admin-panel">
      <div className="admin-panel-heading"><div><h3>Tạo banner mới</h3><p>Ảnh banner được gửi dưới dạng multipart form.</p></div></div>
      <div className="admin-panel-body"><Form onSubmit={saveBannerCreate} className="admin-banner-create">
        <div><Form.Label>Tiêu đề</Form.Label><Form.Control required value={bannerDraft.title} onChange={(event) => setBannerDraft((current) => ({ ...current, title: event.target.value }))} /></div>
        <div><Form.Label>Mô tả</Form.Label><Form.Control value={bannerDraft.subtitle} onChange={(event) => setBannerDraft((current) => ({ ...current, subtitle: event.target.value }))} /></div>
        <div><Form.Label>Trạng thái</Form.Label><Form.Select value={bannerDraft.isActive} onChange={(event) => setBannerDraft((current) => ({ ...current, isActive: event.target.value }))}><option value="1">Đang bật</option><option value="0">Đang tắt</option></Form.Select></div>
        <div><Form.Label>Ảnh banner</Form.Label><Form.Control required type="file" accept="image/*" onChange={(event) => setBannerDraft((current) => ({ ...current, file: (event.currentTarget as HTMLInputElement).files?.[0] || null }))} /></div>
        <Button type="submit" disabled={saving || !bannerDraft.title.trim() || !bannerDraft.file}>Tạo banner</Button>
      </Form></div>
    </section>}

    {section !== "reviews" && section !== "permissions" && section !== "tags" && <>
      {section !== "payments" && section !== "commissions" && section !== "withdrawals" && section !== "advertising" && <FilterPanel section={section} draft={filterDraft} setDraft={setFilterDraft} onSubmit={submitFilters} />}
      <DataTable section={section} data={data} loading={query.isLoading} onAction={askForConfirmation} onEditBanner={openBannerEditor} />
      {(section === "users" || section === "hotels" || section === "bookings" || section === "banners") && <div className="admin-pagination"><span>{total ? `Trang ${page} · ${total} kết quả` : `Trang ${page} · ${data.length} kết quả`}</span><div className="d-flex gap-2"><Button size="sm" variant="outline-secondary" disabled={page <= 1 || query.isFetching} onClick={() => setFilters((current) => ({ ...current, page: String(Math.max(1, page - 1)) }))}>Trước</Button><Button size="sm" variant="outline-secondary" disabled={!hasNextPage || query.isFetching} onClick={() => setFilters((current) => ({ ...current, page: String(page + 1) }))}>Tiếp</Button></div></div>}
    </>}

    <Modal show={Boolean(confirmAction)} onHide={() => setConfirmAction(null)} centered>
      <Modal.Header closeButton><Modal.Title>{confirmAction?.title}</Modal.Title></Modal.Header>
      <Modal.Body>
        <p className="mb-3">{confirmAction?.description}</p>
        {confirmAction?.kind === "withdrawal" && <div className="d-grid gap-3"><div><Form.Label>Mã giao dịch</Form.Label><Form.Control value={transactionRef} onChange={(event) => setTransactionRef(event.target.value)} /></div><div><Form.Label>Ghi chú xử lý</Form.Label><Form.Control as="textarea" rows={3} value={actionNote} onChange={(event) => setActionNote(event.target.value)} /></div></div>}
        {confirmAction?.kind === "advertising-rejection" && <div><Form.Label>Lý do từ chối</Form.Label><Form.Control required as="textarea" rows={3} value={actionNote} onChange={(event) => setActionNote(event.target.value)} /></div>}
      </Modal.Body>
      <Modal.Footer><Button variant="outline-secondary" onClick={() => setConfirmAction(null)}>Hủy</Button><Button variant={confirmAction?.kind === "advertising-rejection" || confirmAction?.status === "DA_HUY" || confirmAction?.title?.includes("Xóa") ? "danger" : "primary"} onClick={() => void executeConfirmed()} disabled={saving}>{saving ? "Đang xử lý..." : "Xác nhận"}</Button></Modal.Footer>
    </Modal>

    <Modal show={Boolean(editingBanner)} onHide={() => setEditingBanner(null)} centered>
      <Modal.Header closeButton><Modal.Title>Chỉnh sửa banner</Modal.Title></Modal.Header>
      <Modal.Body className="d-grid gap-3">
        <div><Form.Label>Tiêu đề</Form.Label><Form.Control value={bannerEditDraft.title} onChange={(event) => setBannerEditDraft((current) => ({ ...current, title: event.target.value }))} /></div>
        <div><Form.Label>Mô tả</Form.Label><Form.Control value={bannerEditDraft.subtitle} onChange={(event) => setBannerEditDraft((current) => ({ ...current, subtitle: event.target.value }))} /></div>
        <div><Form.Label>Đường dẫn</Form.Label><Form.Control value={bannerEditDraft.url} onChange={(event) => setBannerEditDraft((current) => ({ ...current, url: event.target.value }))} /></div>
        <div><Form.Label>Trạng thái</Form.Label><Form.Select value={bannerEditDraft.isActive} onChange={(event) => setBannerEditDraft((current) => ({ ...current, isActive: event.target.value }))}><option value="1">Đang bật</option><option value="0">Đang tắt</option></Form.Select></div>
      </Modal.Body>
      <Modal.Footer><Button variant="outline-secondary" onClick={() => setEditingBanner(null)}>Hủy</Button><Button onClick={() => void saveBanner()} disabled={saving || !bannerEditDraft.title.trim()}>Lưu banner</Button></Modal.Footer>
    </Modal>
  </div>;
}

function FilterPanel({ section, draft, setDraft, onSubmit }: { section: string; draft: Record<string, string>; setDraft: (update: (current: Record<string, string>) => Record<string, string>) => void; onSubmit: (event: React.FormEvent) => void }) {
  const change = (key: string, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return <section className="admin-panel admin-filter-panel">
    <div className="admin-panel-heading"><div><h3>Bộ lọc</h3><p>Thiết lập điều kiện rồi áp dụng để tải dữ liệu.</p></div></div>
    <div className="admin-panel-body"><Form onSubmit={onSubmit} className="admin-filter-grid">
      {section === "bookings" && <>
        <Input label="Hotel ID" value={draft.hotelId} onChange={(value) => change("hotelId", value)} />
        <Input label="Customer ID" value={draft.customerId} onChange={(value) => change("customerId", value)} />
        <SelectInput label="Trạng thái booking" value={draft.trangThai} onChange={(value) => change("trangThai", value)} options={[["", "Tất cả"], ...["CHO_XAC_NHAN", "DA_XAC_NHAN", "DA_CHECK_IN", "DA_CHECK_OUT", "DA_HUY", "TU_CHOI", "KHONG_DEN"].map((status) => [status, status] as [string, string])]} />
        <Input label="Ngày tạo" type="datetime-local" value={draft.ngayTao} onChange={(value) => change("ngayTao", value)} />
      </>}
      {(section === "banners" || section === "hotels" || section === "users") && <Input label="Từ khóa" value={draft.keyword} onChange={(value) => change("keyword", value)} />}
      {section === "banners" && <SelectInput label="Trạng thái" value={draft.isActive} onChange={(value) => change("isActive", value)} options={[["", "Tất cả"], ["1", "Chỉ banner đang bật"]]} />}
      {section === "users" && <SelectInput label="Tài khoản" value={draft.status} onChange={(value) => change("status", value)} options={[["", "Tất cả"], ["0", "Hoạt động"], ["1", "Bị khóa"]]} />}
      {section === "hotels" && <>
        <Input label="Thành phố" value={draft.thanhPho} onChange={(value) => change("thanhPho", value)} />
        <SelectInput label="Số sao" value={draft.soSao} onChange={(value) => change("soSao", value)} options={[["", "Tất cả"], ...[1, 2, 3, 4, 5].map((star) => [String(star), `${star} sao`] as [string, string])]} />
        <SelectInput label="Trạng thái" value={draft.trangThai} onChange={(value) => change("trangThai", value)} options={[["", "Tất cả"], ...hotelStatuses.map((status) => [status, status] as [string, string])]} />
      </>}
      {(section === "users" || section === "hotels") && <SelectInput label="Số dòng" value={draft.pageSize || "20"} onChange={(value) => change("pageSize", value)} options={[["10", "10 / trang"], ["20", "20 / trang"], ["50", "50 / trang"]]} />}
      <div className="admin-filter-submit"><Button type="submit"><FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />Áp dụng</Button></div>
    </Form></div>
  </section>;
}

function DataTable({ section, data, loading, onAction, onEditBanner }: { section: string; data: AdminRowData[]; loading: boolean; onAction: (action: ConfirmAction) => void; onEditBanner?: (item: AdminRowData) => void }) {
  if (["reviews", "permissions"].includes(section)) return null;
  return <section className="admin-panel admin-results-panel">
    <div className="admin-panel-heading"><div><h3>Kết quả</h3><p>{loading ? "Đang tải dữ liệu..." : `${data.length} bản ghi trên trang này`}</p></div></div>
    <div className="admin-table-wrap"><Table className="admin-table" hover responsive>
      <thead><tr><th>Mã</th><th>Nội dung</th><th>Chi tiết</th><th>Trạng thái</th><th className="text-end">Thao tác</th></tr></thead>
      <tbody>
        {data.map((item, index) => <AdminDataRow key={String(field(item, "id", "Id", "userId", "UserId", "tagId", "TagId") ?? index)} item={item} section={section} onAction={onAction} onEditBanner={onEditBanner} />)}
      </tbody>
    </Table></div>
    {loading && <div className="admin-empty">Đang tải dữ liệu...</div>}
    {!loading && data.length === 0 && <div className="admin-empty">Không có dữ liệu phù hợp.</div>}
  </section>;
}

function AdminDataRow({ item, section, onAction, onEditBanner }: { item: AdminRowData; section: string; onAction: (action: ConfirmAction) => void; onEditBanner?: (item: AdminRowData) => void }) {
  const id = field(item, "id", "Id", "userId", "UserId", "tagId", "TagId");
  const currentHotelStatus = String(field(item, "trangThai", "TrangThai") ?? "CHO_DUYET");
  const currentPaymentStatus = String(field(item, "trangThai", "TrangThai") ?? "CHO_THANH_TOAN");
  const [nextStatus, setNextStatus] = useState(section === "hotels" ? currentHotelStatus : currentPaymentStatus);
  const rawStatus = field(item, "trangThai", "TrangThai", "status", "Status", "isActive", "IsActive", "isDel", "IsDel");
  const status = section === "users" ? Number(field(item, "isDel", "IsDel", "status", "Status")) === 1 ? "Bị khóa" : "Hoạt động"
    : section === "banners" || section === "tags" ? Number(field(item, "isActive", "IsActive") ?? 0) === 1 || field(item, "isActive", "IsActive") === true ? "Đang bật" : "Đang tắt"
    : rawStatus ?? "Chưa xác định";
  const name = field(item, "tenKhachSan", "khachSanTen", "hotelName", "HotelName", "title", "Title", "fullName", "FullName", "username", "userName", "UserName", "maGiaoDich", "email", "noiDung", "name", "Name", "slug", "Slug") ?? "Bản ghi";
  const detail = field(item, "roleName", "RoleName", "phone", "Phone", "createAt", "CreateAt", "createdAt", "CreatedAt", "ngayTao", "soSao", "SoSao", "slug", "Slug", "sortOrder", "SortOrder");
  const amount = field(item, "soTien", "SoTien", "amount", "Amount");
  const isLocked = Number(field(item, "isDel", "IsDel", "status", "Status")) === 1;
  const isActive = Number(field(item, "isActive", "IsActive") ?? 0) === 1 || field(item, "isActive", "IsActive") === true;
  const actions: React.ReactNode[] = [];

  if (section === "payments") actions.push(<><Form.Select key="payment-status" size="sm" aria-label="Trạng thái payment" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Form.Select><Button key="payment-update" size="sm" onClick={() => onAction({ title: "Cập nhật thanh toán", description: `Cập nhật payment ${String(id)} sang ${nextStatus}?`, operation: () => updatePaymentStatus(String(id), nextStatus) })}><FontAwesomeIcon icon={faCheck} className="me-1" />Lưu</Button></>);
  if (section === "withdrawals") {
    actions.push(<Button key="processing" size="sm" variant="outline-secondary" onClick={() => onAction({ kind: "withdrawal", id: String(id), status: "DANG_XU_LY", title: "Đánh dấu đang xử lý", description: `Chuyển yêu cầu rút tiền ${String(id)} sang trạng thái DANG_XU_LY?` })}>Đang xử lý</Button>);
    actions.push(<Button key="pay" size="sm" onClick={() => onAction({ kind: "withdrawal", id: String(id), status: "DA_CHI_TRA", title: "Xác nhận chi trả", description: `Ghi nhận chi trả yêu cầu ${String(id)}?` })}>Chi trả</Button>);
    actions.push(<Button key="failed" size="sm" variant="outline-danger" onClick={() => onAction({ kind: "withdrawal", id: String(id), status: "THAT_BAI", title: "Ghi nhận chi trả thất bại", description: `Chuyển yêu cầu rút tiền ${String(id)} sang trạng thái THAT_BAI?` })}>Thất bại</Button>);
    actions.push(<Button key="reject" size="sm" variant="outline-danger" onClick={() => onAction({ kind: "withdrawal", id: String(id), status: "DA_HUY", title: "Hủy yêu cầu", description: `Chuyển yêu cầu rút tiền ${String(id)} sang trạng thái DA_HUY?` })}><FontAwesomeIcon icon={faBan} className="me-1" />Hủy yêu cầu</Button>);
  }
  if (section === "advertising") {
    actions.push(<Button key="approve" size="sm" onClick={() => onAction({ title: "Duyệt quảng cáo", description: `Duyệt chiến dịch ${String(id)}?`, operation: () => approveAdvertising(String(id), true) })}>Duyệt</Button>);
    actions.push(<Button key="reject" size="sm" variant="outline-danger" onClick={() => onAction({ kind: "advertising-rejection", id: String(id), title: "Từ chối quảng cáo", description: `Nhập lý do từ chối chiến dịch ${String(id)}.` })}>Từ chối</Button>);
  }
  if (section === "banners") {
    actions.push(<Button key="edit" size="sm" variant="outline-secondary" onClick={() => onEditBanner?.(item)}><FontAwesomeIcon icon={faPen} className="me-1" />Sửa</Button>);
    actions.push(<Button key="toggle" size="sm" variant="outline-secondary" onClick={() => onAction({ title: isActive ? "Tắt banner" : "Bật banner", description: `Cập nhật trạng thái banner ${String(id)}?`, operation: () => updateBanner(String(id), { title: String(field(item, "title", "Title") ?? ""), subtitle: String(field(item, "subtitle", "Subtitle") ?? ""), url: String(field(item, "url", "Url") ?? ""), isActive: isActive ? 0 : 1 }) })}>{isActive ? "Tắt" : "Bật"}</Button>);
    actions.push(<Button key="delete" size="sm" variant="outline-danger" aria-label="Xóa banner" onClick={() => onAction({ title: "Xóa banner", description: `Xóa banner ${String(id)}? Thao tác này không thể hoàn tác.`, operation: () => deleteBanner(String(id)) })}><FontAwesomeIcon icon={faTrash} /></Button>);
  }
  if (section === "hotels") actions.push(<><Form.Select key="hotel-status" size="sm" aria-label="Trạng thái khách sạn" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>{hotelStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Form.Select><Button key="hotel-update" size="sm" onClick={() => onAction({ title: "Cập nhật trạng thái khách sạn", description: `Chuyển khách sạn ${String(name)} sang ${nextStatus}?`, operation: () => updateHotelStatus(String(id), nextStatus) })}>Lưu</Button></>);
  if (section === "users") actions.push(<Button key="toggle" size="sm" variant={isLocked ? "outline-success" : "outline-danger"} onClick={() => onAction({ title: isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản", description: `${isLocked ? "Mở khóa" : "Khóa"} tài khoản ${String(name)}?`, operation: () => updateAdminUserStatus(String(id), isLocked ? 0 : 1) })}><FontAwesomeIcon icon={isLocked ? faLockOpen : faLock} className="me-1" />{isLocked ? "Mở khóa" : "Khóa"}</Button>);

  return <tr>
    <td><span className="admin-id">{String(id ?? "—")}</span></td>
    <td><span className="admin-primary-cell">{String(name)}</span><span className="admin-secondary-cell">{String(field(item, "email", "Email", "tenKhachSan", "khachSanTen", "hotelName", "HotelName") ?? "")}</span></td>
    <td>{amount !== undefined ? `${Number(amount).toLocaleString("vi-VN")} ₫` : detail === undefined ? "—" : String(detail)}</td>
    <td><span className={`admin-status-badge ${statusClass(status)}`}>{String(typeof status === "boolean" ? status ? "Đang bật" : "Đang tắt" : status)}</span></td>
    <td><div className="admin-action-group justify-content-end">{actions.length ? actions : <span className="text-muted">—</span>}</div></td>
  </tr>;
}

function Input({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (value: string) => void; type?: string }) {
  return <div><Form.Label>{label}</Form.Label><Form.Control type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>;
}

function SelectInput({ label, value, onChange, options }: { label: string; value?: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <div><Form.Label>{label}</Form.Label><Form.Select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>{options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}</Form.Select></div>;
}
