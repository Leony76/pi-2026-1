import { apiPost } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  specialty: string;
  crmCrp: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type RegisterPayload = {
  name: string;
  specialty: string;
  crmCrp: string;
  email: string;
  password: string;
  repeatPassword: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export function registerWithEmail(data: RegisterPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/register", data);
}

export function loginWithEmail(data: LoginPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/login", data);
}
