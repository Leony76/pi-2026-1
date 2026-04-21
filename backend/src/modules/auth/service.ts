import bcrypt from "bcrypt";
import crypto from "crypto";

import prisma from "../../lib/prisma";
import { createHttpError } from "../../lib/http-error";
import { sendPasswordResetCodeEmail } from "../../lib/mailer";
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

type VerifyResetCodeInput = {
	email: string;
	code: string;
};

type PasswordResetInput = {
	sessionToken: string;
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
const PASSWORD_RESET_CODE_TTL_MINUTES = 10;
const PASSWORD_RESET_MAX_ATTEMPTS = 3;
const PASSWORD_RESET_SESSION_TTL_MINUTES = 10;

function addDays(date: Date, days: number): Date {
	return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addHours(date: Date, hours: number): Date {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addMinutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * 60 * 1000);
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
			passwordResetTokenExpiresAt: addMinutes(new Date(), PASSWORD_RESET_CODE_TTL_MINUTES),
			passwordResetAttempts: 0,
			passwordResetSessionTokenHash: null,
			passwordResetSessionExpiresAt: null,
		},
	});
}

async function savePasswordResetSessionToken(userId: string, sessionToken: string): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			passwordResetTokenHash: null,
			passwordResetTokenExpiresAt: null,
			passwordResetAttempts: 0,
			passwordResetSessionTokenHash: hashToken(sessionToken),
			passwordResetSessionExpiresAt: addMinutes(new Date(), PASSWORD_RESET_SESSION_TTL_MINUTES),
		},
	});
}

async function registerInvalidPasswordResetCodeAttempt(email: string): Promise<void> {
	const user = await prisma.user.findFirst({
		where: {
			email,
			passwordResetTokenHash: {
				not: null,
			},
			passwordResetTokenExpiresAt: {
				gt: new Date(),
			},
		},
		select: {
			id: true,
			passwordResetAttempts: true,
		},
	});

	if (!user) {
		return;
	}

	const nextAttempts = user.passwordResetAttempts + 1;

	if (nextAttempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				passwordResetAttempts: nextAttempts,
				passwordResetTokenHash: null,
				passwordResetTokenExpiresAt: null,
			},
		});

		return;
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			passwordResetAttempts: nextAttempts,
		},
	});
}

function generateSixDigitCode(): string {
	return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
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

async function findUserByPasswordResetCode(email: string, code: string) {
	return prisma.user.findFirst({
		where: {
			email,
			passwordResetTokenHash: hashToken(code),
			passwordResetTokenExpiresAt: {
				gt: new Date(),
			},
			passwordResetAttempts: {
				lt: PASSWORD_RESET_MAX_ATTEMPTS,
			},
		},
	});
}

async function findUserByPasswordResetSessionToken(sessionToken: string) {
	return prisma.user.findFirst({
		where: {
			passwordResetSessionTokenHash: hashToken(sessionToken),
			passwordResetSessionExpiresAt: {
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
		throw createHttpError(400, "bad_request", "Campos requeríveis não preenchidos!");
	}

	if (data.password !== data.repeatPassword) {
		throw createHttpError(400, "bad_request", "Senhas não coincidem");
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
		throw createHttpError(409, "conflict", "Usuário com esse e-mail ou CRM/CRP já existe!");
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
		throw createHttpError(400, "bad_request", "E-mail ou senha não providos!");
	}

	const normalizedEmail = normalizeEmail(email);

	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
	});

	if (!user) {
		throw createHttpError(401, "unauthorized", "Credenciais inválidas!");
	}

	const passwordIsValid = await bcrypt.compare(data.password, user.passwordHash);

	if (!passwordIsValid) {
		throw createHttpError(401, "unauthorized", "Credenciais inválidas!");
	}

	const refreshToken = generateOpaqueToken();
	await saveRefreshToken(user.id, refreshToken);

	const safeUser = toSafeUser(user);

	return buildAuthResponse(safeUser, refreshToken);
}

export async function refreshSession(data: RefreshInput): Promise<AuthResponse> {
	if (!data.refreshToken) {
		throw createHttpError(400, "bad_request", "Token de atualização não provido!");
	}

	const user = await findUserByRefreshToken(data.refreshToken);

	if (!user) {
		throw createHttpError(401, "unauthorized", "Token de atualização inválido!");
	}

	const nextRefreshToken = generateOpaqueToken();
	await saveRefreshToken(user.id, nextRefreshToken);

	const safeUser = toSafeUser(user);

	return buildAuthResponse(safeUser, nextRefreshToken);
}

export async function logout(data: LogoutInput): Promise<{ message: string }> {
	if (!data.refreshToken) {
		throw createHttpError(400, "bad_request", "Token de atualização não provido!");
	}

	const user = await findUserByRefreshToken(data.refreshToken);

	if (!user) {
		return { message: "Sessão já limpada!" };
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			refreshTokenHash: null,
			refreshTokenExpiresAt: null,
		},
	});

	return { message: "Desconectado!" };
}

export async function requestEmailVerification(data: EmailVerificationRequestInput): Promise<{ message: string; verificationToken: string }> {
	const email = normalizeEmail(data.email);

	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		throw createHttpError(404, "not_found", "Usuário não encontrado!");
	}

	if (user.emailVerifiedAt) {
		return { message: "E-mail já verificado!", verificationToken: "" };
	}

	const verificationToken = generateOpaqueToken();
	await saveEmailVerificationToken(user.id, verificationToken);

	return {
		message: "Token de verificação gerado!",
		verificationToken,
	};
}

export async function verifyEmail(data: VerifyEmailInput): Promise<{ message: string }> {
	if (!data.token) {
		throw createHttpError(400, "bad_request", "Token de verificação não provido!");
	}

	const user = await findUserByEmailVerificationToken(data.token);

	if (!user) {
		throw createHttpError(401, "unauthorized", "Token de verificação inválido!");
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			emailVerifiedAt: new Date(),
			emailVerificationTokenHash: null,
			emailVerificationTokenExpiresAt: null,
		},
	});

	return { message: "E-mail verificado!" };
}

export async function requestPasswordReset(data: PasswordResetRequestInput): Promise<{ message: string }> {
	const email = data.email?.trim();

	if (!email) {
		throw createHttpError(400, "bad_request", "E-mail não provido!");
	}

	const normalizedEmail = normalizeEmail(email);

	const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

	if (!user) {
		return {
			message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição.",
		};
	}

 	const resetCode = generateSixDigitCode();
	await savePasswordResetToken(user.id, resetCode);
	await sendPasswordResetCodeEmail(user.email, resetCode);

	return {
		message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição.",
	};
}

export async function verifyResetCode(data: VerifyResetCodeInput): Promise<{ message: string; sessionToken: string }> {
	const email = data.email?.trim();
	const code = data.code?.trim();

	if (!email || !code) {
		throw createHttpError(400, "bad_request", "Campos requeríveis não preenchidos!");
	}

	if (!/^\d{6}$/.test(code)) {
		throw createHttpError(400, "bad_request", "Código de redefinição inválido!");
	}

	const normalizedEmail = normalizeEmail(email);
	const user = await findUserByPasswordResetCode(normalizedEmail, code);

	if (!user) {
		await registerInvalidPasswordResetCodeAttempt(normalizedEmail);
		throw createHttpError(401, "unauthorized", "Código de redefinição inválido ou expirado!");
	}

	const sessionToken = generateOpaqueToken();
	await savePasswordResetSessionToken(user.id, sessionToken);

	return {
		message: "Código de redefinição validado!",
		sessionToken,
	};
}

export async function resetPassword(data: PasswordResetInput): Promise<{ message: string }> {
	if (!data.sessionToken || !data.password || !data.repeatPassword) {
		throw createHttpError(400, "bad_request", "Campos requeríveis não preenchidos!");
	}

	if (data.password !== data.repeatPassword) {
		throw createHttpError(400, "bad_request", "Senhas não coincidem!");
	}

	const user = await findUserByPasswordResetSessionToken(data.sessionToken);

	if (!user) {
		throw createHttpError(401, "unauthorized", "Sessão de redefinição inválida ou expirada!");
	}

	const passwordHash = await bcrypt.hash(data.password, 10);

	await prisma.user.update({
		where: { id: user.id },
		data: {
			passwordHash,
			passwordResetTokenHash: null,
			passwordResetTokenExpiresAt: null,
			passwordResetAttempts: 0,
			passwordResetSessionTokenHash: null,
			passwordResetSessionExpiresAt: null,
		},
	});

	return { message: "Senha redefinida!" };
}
