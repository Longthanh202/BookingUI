export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  createBy: null;
}

export interface OwnerRegisterRequest {
  username: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  email: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  bankBranch?: string;
}