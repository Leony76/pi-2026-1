import { SafeUser } from "./safeUser.type";

export type AuthResponse = {
	user: SafeUser;
	token: string;
	accessToken: string;
	refreshToken: string;
	emailVerificationToken?: string;
};