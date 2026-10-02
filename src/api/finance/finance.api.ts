import api from "../axiosInstance";

export interface BankAccountRequest { tenNganHang: string; soTaiKhoan: string; chuTaiKhoan: string; chiNhanh: string | null; qrCode: string | null; isDefault: boolean; }
export interface WithdrawalRequest { khachSanId: string; taiKhoanNganHangId: string; soTien: number; ghiChu: string | null; }
export const getOwnerWallets = async () => (await api.get("/api/finance/wallets")).data;
export const getFinanceStatement = async (params?: { khachSanId?: string; from?: string; to?: string }) => (await api.get("/api/finance/statement", { params })).data;
export const getBankAccounts = async () => (await api.get("/api/finance/bank-accounts")).data;
export const createBankAccount = async (payload: BankAccountRequest) => (await api.post("/api/finance/bank-accounts", payload)).data;
export const createWithdrawal = async (payload: WithdrawalRequest) => (await api.post("/api/finance/withdrawals", payload)).data;
export const getWithdrawals = async () => (await api.get("/api/finance/withdrawals")).data;
export const getPendingWithdrawals = async () => (await api.get("/api/finance/admin/withdrawals/pending")).data;
export const updateWithdrawal = async (id: string, payload: { trangThai: string; maGiaoDich: string | null; ghiChu: string | null }) => (await api.put(`/api/finance/admin/withdrawals/${id}`, payload)).data;