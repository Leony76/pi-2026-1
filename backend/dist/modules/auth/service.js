"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshSession = refreshSession;
exports.logout = logout;
exports.requestEmailVerification = requestEmailVerification;
exports.verifyEmail = verifyEmail;
exports.requestPasswordReset = requestPasswordReset;
exports.resetPassword = resetPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const http_error_1 = require("../../lib/http-error");
const token_1 = require("../../lib/token");
const specialty_1 = require("../shared/specialty");
const REFRESH_TOKEN_TTL_DAYS = 30;
const EMAIL_VERIFICATION_TOKEN_TTL_DAYS = 7;
const PASSWORD_RESET_TOKEN_TTL_HOURS = 1;
function addDays(date, days) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function normalizeCrmCrp(crmCrp) {
    return crmCrp.trim().toUpperCase();
}
function buildAuthResponse(user, refreshToken, emailVerificationToken) {
    const accessToken = (0, token_1.generateAccessToken)(user.id, user.email);
    const response = {
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
function toSafeUser(user) {
    return {
        id: user.id,
        name: user.name,
        specialty: (0, specialty_1.normalizeSpecialty)(user.specialty),
        crmCrp: user.crmCrp,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
    };
}
async function saveRefreshToken(userId, refreshToken) {
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            refreshTokenHash: (0, token_1.hashToken)(refreshToken),
            refreshTokenExpiresAt: addDays(new Date(), REFRESH_TOKEN_TTL_DAYS),
        },
    });
}
async function saveEmailVerificationToken(userId, verificationToken) {
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            emailVerificationTokenHash: (0, token_1.hashToken)(verificationToken),
            emailVerificationTokenExpiresAt: addDays(new Date(), EMAIL_VERIFICATION_TOKEN_TTL_DAYS),
        },
    });
}
async function savePasswordResetToken(userId, resetToken) {
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            passwordResetTokenHash: (0, token_1.hashToken)(resetToken),
            passwordResetTokenExpiresAt: addHours(new Date(), PASSWORD_RESET_TOKEN_TTL_HOURS),
        },
    });
}
async function findUserByRefreshToken(refreshToken) {
    return prisma_1.default.user.findFirst({
        where: {
            refreshTokenHash: (0, token_1.hashToken)(refreshToken),
            refreshTokenExpiresAt: {
                gt: new Date(),
            },
        },
    });
}
async function findUserByEmailVerificationToken(token) {
    return prisma_1.default.user.findFirst({
        where: {
            emailVerificationTokenHash: (0, token_1.hashToken)(token),
            emailVerificationTokenExpiresAt: {
                gt: new Date(),
            },
        },
    });
}
async function findUserByPasswordResetToken(token) {
    return prisma_1.default.user.findFirst({
        where: {
            passwordResetTokenHash: (0, token_1.hashToken)(token),
            passwordResetTokenExpiresAt: {
                gt: new Date(),
            },
        },
    });
}
async function register(data) {
    const name = data.name?.trim();
    const specialty = data.specialty?.trim();
    const crmCrp = data.crmCrp?.trim();
    const email = data.email?.trim();
    if (!name || !specialty || !crmCrp || !email || !data.password || !data.repeatPassword) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Missing required fields");
    }
    if (data.password !== data.repeatPassword) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Passwords do not match");
    }
    const normalizedEmail = normalizeEmail(email);
    const normalizedCrmCrp = normalizeCrmCrp(crmCrp);
    const normalizedSpecialty = (0, specialty_1.normalizeSpecialty)(specialty);
    const existingUser = await prisma_1.default.user.findFirst({
        where: {
            OR: [{ email: normalizedEmail }, { crmCrp: normalizedCrmCrp }],
        },
    });
    if (existingUser) {
        throw (0, http_error_1.createHttpError)(409, "conflict", "User with this e-mail or CRM/CRP already exists");
    }
    const passwordHash = await bcrypt_1.default.hash(data.password, 10);
    const refreshToken = (0, token_1.generateOpaqueToken)();
    const emailVerificationToken = (0, token_1.generateOpaqueToken)();
    const user = await prisma_1.default.user.create({
        data: {
            name,
            specialty: normalizedSpecialty,
            crmCrp: normalizedCrmCrp,
            email: normalizedEmail,
            passwordHash,
            emailVerifiedAt: null,
            refreshTokenHash: (0, token_1.hashToken)(refreshToken),
            refreshTokenExpiresAt: addDays(new Date(), REFRESH_TOKEN_TTL_DAYS),
            emailVerificationTokenHash: (0, token_1.hashToken)(emailVerificationToken),
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
async function login(data) {
    const email = data.email?.trim();
    if (!email || !data.password) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Missing e-mail or password");
    }
    const normalizedEmail = normalizeEmail(email);
    const user = await prisma_1.default.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (!user) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Invalid credentials");
    }
    const passwordIsValid = await bcrypt_1.default.compare(data.password, user.passwordHash);
    if (!passwordIsValid) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Invalid credentials");
    }
    const refreshToken = (0, token_1.generateOpaqueToken)();
    await saveRefreshToken(user.id, refreshToken);
    const safeUser = toSafeUser(user);
    return buildAuthResponse(safeUser, refreshToken);
}
async function refreshSession(data) {
    if (!data.refreshToken) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Missing refresh token");
    }
    const user = await findUserByRefreshToken(data.refreshToken);
    if (!user) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Invalid refresh token");
    }
    const nextRefreshToken = (0, token_1.generateOpaqueToken)();
    await saveRefreshToken(user.id, nextRefreshToken);
    const safeUser = toSafeUser(user);
    return buildAuthResponse(safeUser, nextRefreshToken);
}
async function logout(data) {
    if (!data.refreshToken) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Missing refresh token");
    }
    const user = await findUserByRefreshToken(data.refreshToken);
    if (!user) {
        return { message: "Session already cleared" };
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            refreshTokenHash: null,
            refreshTokenExpiresAt: null,
        },
    });
    return { message: "Logged out" };
}
async function requestEmailVerification(data) {
    const email = normalizeEmail(data.email);
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, http_error_1.createHttpError)(404, "not_found", "User not found");
    }
    if (user.emailVerifiedAt) {
        return { message: "Email already verified", verificationToken: "" };
    }
    const verificationToken = (0, token_1.generateOpaqueToken)();
    await saveEmailVerificationToken(user.id, verificationToken);
    return {
        message: "Verification token generated",
        verificationToken,
    };
}
async function verifyEmail(data) {
    if (!data.token) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Missing verification token");
    }
    const user = await findUserByEmailVerificationToken(data.token);
    if (!user) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Invalid verification token");
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            emailVerifiedAt: new Date(),
            emailVerificationTokenHash: null,
            emailVerificationTokenExpiresAt: null,
        },
    });
    return { message: "Email verified" };
}
async function requestPasswordReset(data) {
    const email = normalizeEmail(data.email);
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, http_error_1.createHttpError)(404, "not_found", "User not found");
    }
    const resetToken = (0, token_1.generateOpaqueToken)();
    await savePasswordResetToken(user.id, resetToken);
    return {
        message: "Password reset token generated",
        resetToken,
    };
}
async function resetPassword(data) {
    if (!data.token || !data.password || !data.repeatPassword) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Missing required fields");
    }
    if (data.password !== data.repeatPassword) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Passwords do not match");
    }
    const user = await findUserByPasswordResetToken(data.token);
    if (!user) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Invalid reset token");
    }
    const passwordHash = await bcrypt_1.default.hash(data.password, 10);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            passwordHash,
            passwordResetTokenHash: null,
            passwordResetTokenExpiresAt: null,
        },
    });
    return { message: "Password updated" };
}
//# sourceMappingURL=service.js.map