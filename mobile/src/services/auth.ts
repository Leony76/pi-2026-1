import { apiGet, apiPost } from "./api";
import { apiPatchWithAuth } from "./auth-api";

export type AuthUser = {
  id: string;
  name: string;
  specialty: string;
  accountType: 'PROFESSIONAL' | 'ENTERPRISE';
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
  specialtyLabel: string;
  accountType: 'PROFESSIONAL' | 'ENTERPRISE';
  crmCrp: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  stats: {
    sessions: number;
    patients: number;
    totalSpent: number;
  };
};

export type UpdateCurrentUserPayload = {
  name: string;
  specialty: string;
  crmCrp: string;
  email: string;
  phone: string;
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

export type RequestPasswordResetResponse = {
  message: string;
};

export type VerifyResetCodeResponse = {
  message: string;
  sessionToken: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export function registerWithEmail(data: RegisterPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/register", data);
}

export function loginWithEmail(data: LoginPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/auth/login", data);
}

export function requestPasswordReset(email: string): Promise<RequestPasswordResetResponse> {
  return apiPost<RequestPasswordResetResponse>("/auth/request-password-reset", { email });
}

export function verifyResetCode(email: string, code: string): Promise<VerifyResetCodeResponse> {
  return apiPost<VerifyResetCodeResponse>("/auth/verify-reset-code", { email, code });
}

export function resetPassword(
  token: string,
  password: string,
  repeatPassword: string,
): Promise<ResetPasswordResponse> {
  return apiPost<ResetPasswordResponse>("/auth/reset-password", {
    sessionToken: token,
    password,
    repeatPassword,
  });
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

type AuthHandlers = {
  token: string;
  refreshToken: string;
  updateTokens: (token: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function updateCurrentUserWithAuth(
  data: UpdateCurrentUserPayload,
  auth: AuthHandlers
): Promise<CurrentUserResponse> {
  return apiPatchWithAuth<CurrentUserResponse>(
    "/users/me",
    data,
    auth.token,
    auth.refreshToken,
    auth.updateTokens,
    auth.signOut
  );
}
