import { useState } from "react";
import { Button, Card, Form, Tab, Tabs } from "react-bootstrap";
import Modal from "../../components/common/SystemModal";
import {
  createBankAccount,
  createWithdrawal,
} from "../../api/finance/finance.api";
import {
  useOwnerBankAccounts,
  useOwnerFinanceStatement,
  useOwnerHotels,
  useOwnerWallets,
  useOwnerWithdrawals,
} from "../../hooks/useOwnerQueries";
import OwnerPageShell from "../../components/owner/OwnerPageShell";
import { DataTable, Field, field, rows } from "../../components/owner/OwnerDataTable";
import { HotelSelector } from "../../components/owner/OwnerSelectors";

export default function WalletOwnerPage() {
  const [hotelId, setHotelId] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [accountForm, setAccountForm] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateAccount = (key: string, value: string) => setAccountForm((current) => ({ ...current, [key]: value }));
  const hotels = useOwnerHotels();
  const wallets = useOwnerWallets();
  const accounts = useOwnerBankAccounts();
  const withdrawals = useOwnerWithdrawals();
  const statements = useOwnerFinanceStatement(form.from, form.to, hotelId);
  const bankAccounts = rows(accounts.data);
  const defaultBankAccount = bankAccounts.find((account) => {
    const isDefault = field(account, "isDefault");
    return isDefault === true || isDefault === "true";
  }) ?? bankAccounts[0];
  const bankId = field(defaultBankAccount, "id", "taiKhoanNganHangId");
  const hotelSelect = <HotelSelector data={hotels.data} value={hotelId} onChange={setHotelId} />;

  const addWithdrawal = async () => {
    try {
      await createWithdrawal({
        khachSanId: hotelId,
        taiKhoanNganHangId: bankId,
        soTien: Number(form.soTien || 0),
        ghiChu: form.ghiChu || null,
      });
      setNotice("Đã gửi yêu cầu rút tiền.");
      setShowWithdrawal(false);
      await withdrawals.refetch();
    } catch (error: any) {
      setNotice(error?.response?.data?.message || "Không thể tạo yêu cầu rút tiền.");
    }
  };

  const addBankAccount = async () => {
    try {
      await createBankAccount({
        tenNganHang: accountForm.tenNganHang || "",
        soTaiKhoan: accountForm.soTaiKhoan || "",
        chuTaiKhoan: accountForm.chuTaiKhoan || "",
        chiNhanh: accountForm.chiNhanh || null,
        qrCode: accountForm.qrCode || null,
        isDefault: accountForm.isDefault === "false" ? false : true,
      });
      setNotice("Đã thêm tài khoản ngân hàng.");
      setAccountForm({});
      setShowAccount(false);
      await accounts.refetch();
    } catch (error: any) {
      setNotice(error?.response?.data?.message || "Không thể thêm tài khoản ngân hàng.");
    }
  };

  return (
    <OwnerPageShell title="Ví & giao dịch" description="Theo dõi số dư, yêu cầu rút tiền và lịch sử dòng tiền." notice={notice} onDismissNotice={() => setNotice("")}>
      <>
        <div className="owner-wallet-balances row g-3 mb-4">
          {rows(wallets.data).map((wallet: any, index) => (
            <div className="col-md-4" key={field(wallet, "id") || index}>
              <Card><Card.Body><small className="text-muted">Số dư ví</small><h3>{Number(field(wallet, "soDu", "balance") === "-" ? 0 : field(wallet, "soDu", "balance")).toLocaleString("vi-VN")} đ</h3><small>Khách sạn: {field(wallet, "khachSanId", "hotelId")}</small></Card.Body></Card>
            </div>
          ))}
        </div>
        <Tabs defaultActiveKey="withdrawals" className="mb-4">
          <Tab eventKey="withdrawals" title="Lịch sử yêu cầu rút tiền">
            <Card><Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div><h5>Yêu cầu rút tiền</h5><small className="text-muted">Theo dõi trạng thái các yêu cầu đã gửi</small></div>
                <Button disabled={bankId === "-" || !hotelId} onClick={() => setShowWithdrawal(true)}>Tạo yêu cầu rút</Button>
              </div>
              <DataTable data={withdrawals.data} columns={["soTien", "trangThai", "createdAt"]} money={["soTien"]} />
            </Card.Body></Card>
          </Tab>
          <Tab eventKey="accounts" title="Tài khoản nhận tiền">
            <Card><Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div><h5>Thông tin tài khoản</h5><small className="text-muted">Tài khoản nhận tiền của Owner</small></div>
                <Button onClick={() => setShowAccount(true)}>Thêm tài khoản</Button>
              </div>
              <DataTable data={accounts.data} columns={["tenNganHang", "soTaiKhoan", "chuTaiKhoan", "chiNhanh"]} />
            </Card.Body></Card>
          </Tab>
        </Tabs>
        <Card className="owner-statement-card"><Card.Body>
          <h5>Sao kê giao dịch</h5>
          <small className="text-muted">Lọc giao dịch theo khách sạn và khoảng thời gian</small>
          <div className="owner-statement-filters mt-3">
            <div>{hotelSelect}</div>
            <Field label="Từ ngày" type="date" value={form.from} onChange={(value) => update("from", value)} />
            <Field label="Đến ngày" type="date" value={form.to} onChange={(value) => update("to", value)} />
          </div>
          <DataTable data={statements.data} columns={["loaiGiaoDich", "soTien", "createdAt"]} money={["soTien"]} />
        </Card.Body></Card>

        <Modal show={showWithdrawal} onHide={() => setShowWithdrawal(false)} centered className="owner-withdrawal-modal owner-layout-modal">
          <Modal.Header closeButton><Modal.Title>Gửi yêu cầu rút tiền</Modal.Title></Modal.Header>
          <Modal.Body>
            <p>Tài khoản ngân hàng đã đăng ký sẽ được sử dụng.</p>
            <div className="owner-withdrawal-form">
              <div><Form.Label>Khách sạn</Form.Label>{hotelSelect}</div>
              <Field label="Số tiền muốn rút" type="number" value={form.soTien} onChange={(value) => update("soTien", value)} />
              <Field label="Ghi chú" value={form.ghiChu} onChange={(value) => update("ghiChu", value)} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowWithdrawal(false)}>Đóng</Button>
            <Button disabled={bankId === "-" || !hotelId || !form.soTien} onClick={addWithdrawal}>Gửi yêu cầu</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAccount} onHide={() => setShowAccount(false)} centered className="owner-layout-modal">
          <Modal.Header closeButton><Modal.Title>Thêm tài khoản ngân hàng</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Tên ngân hàng</Form.Label><Form.Control value={accountForm.tenNganHang || ""} onChange={(event) => updateAccount("tenNganHang", event.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Số tài khoản</Form.Label><Form.Control value={accountForm.soTaiKhoan || ""} onChange={(event) => updateAccount("soTaiKhoan", event.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Chủ tài khoản</Form.Label><Form.Control value={accountForm.chuTaiKhoan || ""} onChange={(event) => updateAccount("chuTaiKhoan", event.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Chi nhánh</Form.Label><Form.Control value={accountForm.chiNhanh || ""} onChange={(event) => updateAccount("chiNhanh", event.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Mã QR</Form.Label><Form.Control value={accountForm.qrCode || ""} onChange={(event) => updateAccount("qrCode", event.target.value)} /></Form.Group>
            <Form.Check type="checkbox" label="Đặt làm tài khoản mặc định" checked={accountForm.isDefault !== "false"} onChange={(event) => updateAccount("isDefault", String(event.target.checked))} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAccount(false)}>Đóng</Button>
            <Button disabled={!accountForm.tenNganHang || !accountForm.soTaiKhoan || !accountForm.chuTaiKhoan} onClick={addBankAccount}>Lưu tài khoản</Button>
          </Modal.Footer>
        </Modal>
      </>
    </OwnerPageShell>
  );
}
