import { AuthUser } from "./authUser.type";

export type AuthResponse = {
  user: AuthUser;
  token: string;
  refreshToken?: string;
};