import { AppRole } from '../models/order.model';

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  branchId?: string | null;
  branchName?: string | null;
  workshopId?: string | null;
  workshopName?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: CurrentUser;
}
