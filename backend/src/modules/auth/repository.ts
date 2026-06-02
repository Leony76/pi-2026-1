import prisma from "../../lib/prisma";
import { addDays } from "../../utils/addDays.util";
import { addMinutes } from "../../utils/addMinutes.util";
import { REFRESH_TOKEN_TTL_DAYS, EMAIL_VERIFICATION_TOKEN_TTL_DAYS, PASSWORD_RESET_CODE_TTL_MINUTES, PASSWORD_RESET_SESSION_TTL_MINUTES, PASSWORD_RESET_MAX_ATTEMPTS } from "../../consts/auth/service.consts";
import { hashToken } from "../../lib/token";
import { RegisterPayload } from "../../types/auth/registerPayload.type";

export class AuthRepository {

  public static async existingUserByCrpOrEmail(email: string, crmCrp: string) {
    return await prisma.user.findFirst({
			where: {
				OR: [{ email }, { crmCrp }],
			},
		})
  }

  public static async register(data: RegisterPayload) {
    return await prisma.user.create({
			data: {
				name: data.name,
				specialty: data.specialty,
				crmCrp: data.crmCrp,
				email: data.email,
				passwordHash: data.passwordHash,
				emailVerifiedAt: data.emailVerifiedAt,
				refreshTokenHash: data.refreshTokenHash,
				refreshTokenExpiresAt: data.refreshTokenExpiresAt,
				emailVerificationTokenHash: data.emailVerificationTokenHash,
				emailVerificationTokenExpiresAt: data.emailVerificationTokenExpiresAt,
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
		})
  }



  public static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
			where: { email },
		});
  }



	public static async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
		await prisma.user.update({
			where: { id: userId },
			data: {
				refreshTokenHash: hashToken(refreshToken),
				refreshTokenExpiresAt: addDays(new Date(), REFRESH_TOKEN_TTL_DAYS),
			},
		});
	}
	
	
	
	public static async saveEmailVerificationToken(userId: string, verificationToken: string): Promise<void> {
		await prisma.user.update({
			where: { id: userId },
			data: {
				emailVerificationTokenHash: hashToken(verificationToken),
				emailVerificationTokenExpiresAt: addDays(new Date(), EMAIL_VERIFICATION_TOKEN_TTL_DAYS),
			},
		});
	}
	
	
	
	public static async savePasswordResetToken(userId: string, resetToken: string): Promise<void> {
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
	
	
	
	public static async savePasswordResetSessionToken(userId: string, sessionToken: string): Promise<void> {
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
	
	
	
	public static async registerInvalidPasswordResetCodeAttempt(email: string): Promise<void> {
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
	
		if (!user) return;
	
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
	
	
	
	public static async findUserByRefreshToken(refreshToken: string) {
		return prisma.user.findFirst({
			where: {
				refreshTokenHash: hashToken(refreshToken),
				refreshTokenExpiresAt: {
					gt: new Date(),
				},
			},
		});
	}
	
	
	
	public static async findUserByEmailVerificationToken(token: string) {
		return prisma.user.findFirst({
			where: {
				emailVerificationTokenHash: hashToken(token),
				emailVerificationTokenExpiresAt: {
					gt: new Date(),
				},
			},
		});
	}
	
	
	
	public static async findUserByPasswordResetCode(email: string, code: string) {
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
	
	
	
	public static async findUserByPasswordResetSessionToken(sessionToken: string) {
		return prisma.user.findFirst({
			where: {
				passwordResetSessionTokenHash: hashToken(sessionToken),
				passwordResetSessionExpiresAt: {
					gt: new Date(),
				},
			},
		});
	}
	
	
	
	public static async logout(userId: string) {
		return await prisma.user.update({
			where: { id: userId },
			data: {
				refreshTokenHash: null,
				refreshTokenExpiresAt: null,
			},
		});
	}
	
	
	
	public static async verifyEmail(userId: string) {
		return await prisma.user.update({
			where: { id: userId },
			data: {
				emailVerifiedAt: new Date(),
				emailVerificationTokenHash: null,
				emailVerificationTokenExpiresAt: null,
			},
		});
	}
		
	
	
	public static async resetPassword(userId: string, passwordHash: string) {
		return await prisma.user.update({
			where: { id: userId },
			data: {
				passwordHash,
				passwordResetTokenHash: null,
				passwordResetTokenExpiresAt: null,
				passwordResetAttempts: 0,
				passwordResetSessionTokenHash: null,
				passwordResetSessionExpiresAt: null,
			},
		});
	}
}

