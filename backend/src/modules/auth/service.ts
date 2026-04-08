import bcrypt from "bcrypt";

import prisma from "../../lib/prisma";
import { createHttpError } from "../../lib/http-error";
import {
	generateAccessToken,
	generateOpaqueToken,
	hashToken,
} from "../../lib/token";
import { normalizeSpecialty } from "../shared/specialty";

type RegisterInput = {
	name: string;
	specialty: string;
	crmCrp: string;
	email: string;
	password: string;
	repeatPassword: string;
};

type LoginInput = {
	email: string;
	password: string;
};

type RefreshInput = {
	refreshToken: string;
};

type EmailVerificationRequestInput = {
	email: string;
};

type VerifyEmailInput = {
	token: string;
};

type PasswordResetRequestInput = {
	email: string;
};

type PasswordResetInput = {
	token: string;
	password: string;
	repeatPassword: string;
};

type LogoutInput = {
	refreshToken: string;
};

type SafeUser = {
	id: string;
	name: string;
	specialty: string;
	crmCrp: string;
	email: string;
	emailVerifiedAt: Date | null;
	createdAt: Date;
};

type AuthResponse = {
	user: SafeUser;
	token: string;
	accessToken: string;
	refreshToken: string;
	emailVerificationToken?: string;
};

const REFRESH_TOKEN_TTL_DAYS = 30;
const EMAIL_VERIFICATION_TOKEN_TTL_DAYS = 7;
const PASSWORD_RESET_TOKEN_TTL_HOURS = 1;

function addDays(date: Date, days: number): Date {
	return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addHours(date: Date, hours: number): Date {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function normalizeCrmCrp(crmCrp: string): string {
	return crmCrp.trim().toUpperCase();
}

function buildAuthResponse(user: SafeUser, refreshToken: string, emailVerificationToken?: string): AuthResponse {
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

function toSafeUser(user: {
	id: string;
	name: string;
	specialty: string;
	crmCrp: string;
	email: string;
	emailVerifiedAt: Date | null;
	createdAt: Date;
}): SafeUser {
	return {
		id: user.id,
		name: user.name,
		specialty: normalizeSpecialty(user.specialty),
		crmCrp: user.crmCrp,
		email: user.email,
		emailVerifiedAt: user.emailVerifiedAt,
		createdAt: user.createdAt,
	};
}

async function saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			refreshTokenHash: hashToken(refreshToken),
			refreshTokenExpiresAt: addDays(new Date(), REFRESH_TOKEN_TTL_DAYS),
		},
	});
}

async function saveEmailVerificationToken(userId: string, verificationToken: string): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			emailVerificationTokenHash: hashToken(verificationToken),
			emailVerificationTokenExpiresAt: addDays(new Date(), EMAIL_VERIFICATION_TOKEN_TTL_DAYS),
		},
	});
}

async function savePasswordResetToken(userId: string, resetToken: string): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			passwordResetTokenHash: hashToken(resetToken),
			passwordResetTokenExpiresAt: addHours(new Date(), PASSWORD_RESET_TOKEN_TTL_HOURS),
		},
	});
}

async function findUserByRefreshToken(refreshToken: string) {
	return prisma.user.findFirst({
		where: {
			refreshTokenHash: hashToken(refreshToken),
			refreshTokenExpiresAt: {
				gt: new Date(),
			},
		},
	});
}

async function findUserByEmailVerificationToken(token: string) {
	return prisma.user.findFirst({
		where: {
			emailVerificationTokenHash: hashToken(token),
			emailVerificationTokenExpiresAt: {
				gt: new Date(),
			},
		},
	});
}

async function findUserByPasswordResetToken(token: string) {
	return prisma.user.findFirst({
		where: {
			passwordResetTokenHash: hashToken(token),
			passwordResetTokenExpiresAt: {
				gt: new Date(),
			},
		},
	});
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
	const name = data.name?.trim();
	const specialty = data.specialty?.trim();
	const crmCrp = data.crmCrp?.trim();
	const email = data.email?.trim();

	if (!name || !specialty || !crmCrp || !email || !data.password || !data.repeatPassword) {
		throw createHttpError(400, "bad_request", "Missing required fields");
	}

	if (data.password !== data.repeatPassword) {
		throw createHttpError(400, "bad_request", "Passwords do not match");
	}

	const normalizedEmail = normalizeEmail(email);
	const normalizedCrmCrp = normalizeCrmCrp(crmCrp);
	const normalizedSpecialty = normalizeSpecialty(specialty);

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ email: normalizedEmail }, { crmCrp: normalizedCrmCrp }],
		},
	});

	if (existingUser) {
		throw createHttpError(409, "conflict", "User with this e-mail or CRM/CRP already exists");
	}

	const passwordHash = await bcrypt.hash(data.password, 10);
	const refreshToken = generateOpaqueToken();
	const emailVerificationToken = generateOpaqueToken();

	const user = await prisma.user.create({
		data: {
			name,
			specialty: normalizedSpecialty,
			crmCrp: normalizedCrmCrp,
			email: normalizedEmail,
			passwordHash,
			emailVerifiedAt: null,
			refreshTokenHash: hashToken(refreshToken),
			refreshTokenExpiresAt: addDays(new Date(), REFRESH_TOKEN_TTL_DAYS),
			emailVerificationTokenHash: hashToken(emailVerificationToken),
			emailVerificationTokenExpiresAt: addDays(new Date(), EMAIL_VERIFICATION_TOKEN_TTL_DAYS),
		},
		select: {
			id: true,
			name: true,
			specialty: true,
			crmCrp: true,
			email: true,
			emailVerifiedAt: true,
			createdAt: true,
		},
	});

	return buildAuthResponse(toSafeUser(user), refreshToken, emailVerificationToken);
}

export async function login(data: LoginInput): Promise<AuthResponse> {
	const email = data.email?.trim();

	if (!email || !data.password) {
		throw createHttpError(400, "bad_request", "Missing e-mail or password");
	}

	const normalizedEmail = normalizeEmail(email);

	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
	});

	if (!user) {
		throw createHttpError(401, "unauthorized", "Invalid credentials");
	}

	const passwordIsValid = await bcrypt.compare(data.password, user.passwordHash);

	if (!passwordIsValid) {
		throw createHttpError(401, "unauthorized", "Invalid credentials");
	}

	const refreshToken = generateOpaqueToken();
	await saveRefreshToken(user.id, refreshToken);

	const safeUser = toSafeUser(user);

	return buildAuthResponse(safeUser, refreshToken);
}

export async function refreshSession(data: RefreshInput): Promise<AuthResponse> {
	if (!data.refreshToken) {
		throw createHttpError(400, "bad_request", "Missing refresh token");
	}

	const user = await findUserByRefreshToken(data.refreshToken);

	if (!user) {
		throw createHttpError(401, "unauthorized", "Invalid refresh token");
	}

	const nextRefreshToken = generateOpaqueToken();
	await saveRefreshToken(user.id, nextRefreshToken);

	const safeUser = toSafeUser(user);

	return buildAuthResponse(safeUser, nextRefreshToken);
}

export async function logout(data: LogoutInput): Promise<{ message: string }> {
	if (!data.refreshToken) {
		throw createHttpError(400, "bad_request", "Missing refresh token");
	}

	const user = await findUserByRefreshToken(data.refreshToken);

	if (!user) {
		return { message: "Session already cleared" };
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			refreshTokenHash: null,
			refreshTokenExpiresAt: null,
		},
	});

	return { message: "Logged out" };
}

export async function requestEmailVerification(data: EmailVerificationRequestInput): Promise<{ message: string; verificationToken: string }> {
	const email = normalizeEmail(data.email);

	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		throw createHttpError(404, "not_found", "User not found");
	}

	if (user.emailVerifiedAt) {
		return { message: "Email already verified", verificationToken: "" };
	}

	const verificationToken = generateOpaqueToken();
	await saveEmailVerificationToken(user.id, verificationToken);

	return {
		message: "Verification token generated",
		verificationToken,
	};
}

export async function verifyEmail(data: VerifyEmailInput): Promise<{ message: string }> {
	if (!data.token) {
		throw createHttpError(400, "bad_request", "Missing verification token");
	}

	const user = await findUserByEmailVerificationToken(data.token);

	if (!user) {
		throw createHttpError(401, "unauthorized", "Invalid verification token");
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			emailVerifiedAt: new Date(),
			emailVerificationTokenHash: null,
			emailVerificationTokenExpiresAt: null,
		},
	});

	return { message: "Email verified" };
}

export async function requestPasswordReset(data: PasswordResetRequestInput): Promise<{ message: string; resetToken: string }> {
	const email = normalizeEmail(data.email);

	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		throw createHttpError(404, "not_found", "User not found");
	}

	const resetToken = generateOpaqueToken();
	await savePasswordResetToken(user.id, resetToken);

	return {
		message: "Password reset token generated",
		resetToken,
	};
}

export async function resetPassword(data: PasswordResetInput): Promise<{ message: string }> {
	if (!data.token || !data.password || !data.repeatPassword) {
		throw createHttpError(400, "bad_request", "Missing required fields");
	}

	if (data.password !== data.repeatPassword) {
		throw createHttpError(400, "bad_request", "Passwords do not match");
	}

	const user = await findUserByPasswordResetToken(data.token);

	if (!user) {
		throw createHttpError(401, "unauthorized", "Invalid reset token");
	}

	const passwordHash = await bcrypt.hash(data.password, 10);

	await prisma.user.update({
		where: { id: user.id },
		data: {
			passwordHash,
			passwordResetTokenHash: null,
			passwordResetTokenExpiresAt: null,
		},
	});

	return { message: "Password updated" };
}
