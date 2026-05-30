import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";
import { createHttpError } from "../../lib/http-error";
import { sendPasswordResetCodeEmail } from "../../lib/mailer";
import { generateOpaqueToken, hashToken } from "../../lib/token";
import { normalizeSpecialty } from "../shared/specialty";
import { RegisterInput } from "../../types/auth/registerInput.type";
import { AuthResponse } from "../../types/auth/authResponse.type";
import { EmailVerificationRequestInput } from "../../types/auth/emailVerificationRequestInput.type";
import { LoginInput } from "../../types/auth/loginInput.type";
import { LogoutInput } from "../../types/auth/logoutInput.type";
import { PasswordResetInput } from "../../types/auth/passwordResetInput.type";
import { PasswordResetRequestInput } from "../../types/auth/passwordResetRequestInput.type";
import { RefreshInput } from "../../types/auth/refreshInput.type";
import { VerifyEmailInput } from "../../types/auth/verifyEmailInput.type";
import { VerifyResetCodeInput } from "../../types/auth/verifyResetCodeInput.type";
import { addDays } from "../../utils/addDays.util";
import { normalizeCrmCrp } from "../../utils/normalizeCrpCrp.util";
import { normalizeEmail } from "../../utils/normalizeEmail.util";
import { REFRESH_TOKEN_TTL_DAYS, EMAIL_VERIFICATION_TOKEN_TTL_DAYS } from "../../consts/auth/service.consts";
import { buildAuthResponse } from "../../utils/buildAuthResponse.util";
import { toSafeUser } from "../../utils/toSafeUser.type";
import { generateSixDigitCode } from "../../utils/generateSixDigitCode.util";
import { AuthRepository } from "./repository";

export class AuthService {

	public static async register(data: RegisterInput): Promise<AuthResponse> {
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
	
		const existingUser = await AuthRepository.existingUserByCrpOrEmail(
			normalizedEmail,
			normalizedCrmCrp,
		);
	
		if (existingUser) {
			throw createHttpError(409, "conflict", "Usuário com esse e-mail ou CRM/CRP já existe!");
		}
	
		const passwordHash = await bcrypt.hash(data.password, 10);
		const refreshToken = generateOpaqueToken();
		const emailVerificationToken = generateOpaqueToken();
	
		const user = await AuthRepository.register({
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
		});

		return buildAuthResponse(toSafeUser(user), refreshToken, emailVerificationToken);
	}
	

	
	
	public static async login(data: LoginInput): Promise<AuthResponse> {
		const email = data.email?.trim();
	
		if (!email || !data.password) {
			throw createHttpError(400, "bad_request", "E-mail ou senha não providos!");
		}
	
		const normalizedEmail = normalizeEmail(email);
	
		const user = await AuthRepository.findUserByEmail(normalizedEmail);
	
		if (!user) {
			throw createHttpError(401, "unauthorized", "Credenciais inválidas!");
		}
	
		const passwordIsValid = await bcrypt.compare(data.password, user.passwordHash);
	
		if (!passwordIsValid) {
			throw createHttpError(401, "unauthorized", "Credenciais inválidas!");
		}
	
		const refreshToken = generateOpaqueToken();

		await AuthRepository.saveRefreshToken(user.id, refreshToken);
	
		const safeUser = toSafeUser(user);
	
		return buildAuthResponse(safeUser, refreshToken);
	}
	
	
	
	public static async refreshSession(data: RefreshInput): Promise<AuthResponse> {
		if (!data.refreshToken) {
			throw createHttpError(400, "bad_request", "Token de atualização não provido!");
		}
	
		const user = await AuthRepository.findUserByRefreshToken(data.refreshToken);
	
		if (!user) {
			throw createHttpError(401, "unauthorized", "Token de atualização inválido!");
		}
	
		const nextRefreshToken = generateOpaqueToken();

		await AuthRepository.saveRefreshToken(user.id, nextRefreshToken);
	
		const safeUser = toSafeUser(user);
	
		return buildAuthResponse(safeUser, nextRefreshToken);
	}
	
	
	
	public static async logout(data: LogoutInput): Promise<{ message: string }> {
		if (!data.refreshToken) {
			throw createHttpError(400, "bad_request", "Token de atualização não provido!");
		}
	
		const user = await AuthRepository.findUserByRefreshToken(data.refreshToken);
	
		if (!user) {
			return { message: "Sessão já limpada!" };
		}
	
		await AuthRepository.logout(user.id);
	
		return { message: "Desconectado!" };
	}
	
	
	
	public static async requestEmailVerification(data: EmailVerificationRequestInput): Promise<{ message: string; verificationToken: string }> {
		const email = normalizeEmail(data.email);
	
		const user = await AuthRepository.findUserByEmail(email);
	
		if (!user) {
			throw createHttpError(404, "not_found", "Usuário não encontrado!");
		} if (user.emailVerifiedAt) {
			return { message: "E-mail já verificado!", verificationToken: "" };
		}
	
		const verificationToken = generateOpaqueToken();

		await AuthRepository.saveEmailVerificationToken(user.id, verificationToken);
	
		return {
			message: "Token de verificação gerado!",
			verificationToken,
		};
	}
	
	
	
	public static async verifyEmail(data: VerifyEmailInput): Promise<{ message: string }> {
		if (!data.token) {
			throw createHttpError(400, "bad_request", "Token de verificação não provido!");
		}
	
		const user = await AuthRepository.findUserByEmailVerificationToken(data.token);
	
		if (!user) {
			throw createHttpError(401, "unauthorized", "Token de verificação inválido!");
		}
	
		await AuthRepository.verifyEmail(user.id);
	
		return { message: "E-mail verificado!" };
	}
	
	
	
	public static async requestPasswordReset(data: PasswordResetRequestInput): Promise<{ message: string }> {
		const email = data.email?.trim();
	
		if (!email) {
			throw createHttpError(400, "bad_request", "E-mail não provido!");
		}
	
		const normalizedEmail = normalizeEmail(email);
	
		const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
	
		if (!user) {
			return { message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição." };
		}
	
		const resetCode = generateSixDigitCode();

		await AuthRepository.savePasswordResetToken(user.id, resetCode);

		await sendPasswordResetCodeEmail(user.email, resetCode);
	
		return {
			message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição.",
		};
	}
	
	
	
	public static async verifyResetCode(data: VerifyResetCodeInput): Promise<{ message: string; sessionToken: string }> {
		const email = data.email?.trim();
		const code = data.code?.trim();
	
		if (!email || !code) {
			throw createHttpError(400, "bad_request", "Campos requeríveis não preenchidos!");
		}
	
		if (!/^\d{6}$/.test(code)) {
			throw createHttpError(400, "bad_request", "Código de redefinição inválido!");
		}
	
		const normalizedEmail = normalizeEmail(email);
		const user = await AuthRepository.findUserByPasswordResetCode(normalizedEmail, code);
	
		if (!user) {
			await AuthRepository.registerInvalidPasswordResetCodeAttempt(normalizedEmail);
			throw createHttpError(401, "unauthorized", "Código de redefinição inválido ou expirado!");
		}
	
		const sessionToken = generateOpaqueToken();

		await AuthRepository.savePasswordResetSessionToken(user.id, sessionToken);
	
		return {
			message: "Código de redefinição validado!",
			sessionToken,
		};
	}
	
	
	
	public static async resetPassword(data: PasswordResetInput): Promise<{ message: string }> {
		if (!data.sessionToken || !data.password || !data.repeatPassword) {
			throw createHttpError(400, "bad_request", "Campos requeríveis não preenchidos!");
		}
	
		if (data.password !== data.repeatPassword) {
			throw createHttpError(400, "bad_request", "Senhas não coincidem!");
		}
	
		const user = await AuthRepository.findUserByPasswordResetSessionToken(data.sessionToken);
	
		if (!user) {
			throw createHttpError(401, "unauthorized", "Sessão de redefinição inválida ou expirada!");
		}
	
		const passwordHash = await bcrypt.hash(data.password, 10);
	
		await AuthRepository.resetPassword(user.id, passwordHash);
	
		return { message: "Senha redefinida!" };
	}
}

