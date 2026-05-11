import { apiPost } from "./api";

export type RefreshTokenResponse = {
  token: string;
  refreshToken: string;
};

export function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return apiPost<RefreshTokenResponse>("/auth/refresh", { refreshToken });
}
