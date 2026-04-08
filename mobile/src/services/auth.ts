import { apiGet, apiPost } from "./api";

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
  refreshToken?: string;
};

export type RefreshTokenResponse = {
  token: string;
  refreshToken: string;
};

export type CurrentUserResponse = {
  id: string;
  name: string;
  specialty: string;
  crmCrp: string;
  email: string;
  createdAt: string;
  updatedAt: string;
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

export function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return apiPost<RefreshTokenResponse>("/auth/refresh", { refreshToken });
}

export function logoutUser(token: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/logout", {}, token);
}

export function fetchCurrentUser(token: string): Promise<CurrentUserResponse> {
  return apiGet<CurrentUserResponse>("/users/me", token);
}
