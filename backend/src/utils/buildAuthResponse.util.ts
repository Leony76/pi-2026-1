import { generateAccessToken } from "../lib/token";
import { AuthResponse } from "../types/auth/authResponse.type";
import { SafeUser } from "../types/auth/safeUser.type";

export function buildAuthResponse(user: SafeUser, refreshToken: string, emailVerificationToken?: string): AuthResponse {
  const accessToken = generateAccessToken(user.id, user.email);
  const response: AuthResponse = {
    user,
    token: accessToken,
    accessToken,
    refreshToken,
  };

  if (emailVerificationToken) {
    response.emailVerificationToken = emailVerificationToken;
  }

  return response;
}