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
exports.verifyResetCode = verifyResetCode;
exports.resetPassword = resetPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const http_error_1 = require("../../lib/http-error");
const mailer_1 = require("../../lib/mailer");
const token_1 = require("../../lib/token");
const specialty_1 = require("../shared/specialty");
const REFRESH_TOKEN_TTL_DAYS = 30;
const EMAIL_VERIFICATION_TOKEN_TTL_DAYS = 7;
const PASSWORD_RESET_CODE_TTL_MINUTES = 10;
const PASSWORD_RESET_MAX_ATTEMPTS = 3;
const PASSWORD_RESET_SESSION_TTL_MINUTES = 10;
function addDays(date, days) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
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
            passwordResetTokenExpiresAt: addMinutes(new Date(), PASSWORD_RESET_CODE_TTL_MINUTES),
            passwordResetAttempts: 0,
            passwordResetSessionTokenHash: null,
            passwordResetSessionExpiresAt: null,
        },
    });
}
async function savePasswordResetSessionToken(userId, sessionToken) {
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            passwordResetTokenHash: null,
            passwordResetTokenExpiresAt: null,
            passwordResetAttempts: 0,
            passwordResetSessionTokenHash: (0, token_1.hashToken)(sessionToken),
            passwordResetSessionExpiresAt: addMinutes(new Date(), PASSWORD_RESET_SESSION_TTL_MINUTES),
        },
    });
}
async function registerInvalidPasswordResetCodeAttempt(email) {
    const user = await prisma_1.default.user.findFirst({
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
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                passwordResetAttempts: nextAttempts,
                passwordResetTokenHash: null,
                passwordResetTokenExpiresAt: null,
            },
        });
        return;
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            passwordResetAttempts: nextAttempts,
        },
    });
}
function generateSixDigitCode() {
    return crypto_1.default.randomInt(0, 1000000).toString().padStart(6, "0");
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
async function findUserByPasswordResetCode(email, code) {
    return prisma_1.default.user.findFirst({
        where: {
            email,
            passwordResetTokenHash: (0, token_1.hashToken)(code),
            passwordResetTokenExpiresAt: {
                gt: new Date(),
            },
            passwordResetAttempts: {
                lt: PASSWORD_RESET_MAX_ATTEMPTS,
            },
        },
    });
}
async function findUserByPasswordResetSessionToken(sessionToken) {
    return prisma_1.default.user.findFirst({
        where: {
            passwordResetSessionTokenHash: (0, token_1.hashToken)(sessionToken),
            passwordResetSessionExpiresAt: {
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
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Campos requeríveis não preenchidos!");
    }
    if (data.password !== data.repeatPassword) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Senhas não coincidem");
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
        throw (0, http_error_1.createHttpError)(409, "conflict", "Usuário com esse e-mail ou CRM/CRP já existe!");
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
        throw (0, http_error_1.createHttpError)(400, "bad_request", "E-mail ou senha não providos!");
    }
    const normalizedEmail = normalizeEmail(email);
    const user = await prisma_1.default.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (!user) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Credenciais inválidas!");
    }
    const passwordIsValid = await bcrypt_1.default.compare(data.password, user.passwordHash);
    if (!passwordIsValid) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Credenciais inválidas!");
    }
    const refreshToken = (0, token_1.generateOpaqueToken)();
    await saveRefreshToken(user.id, refreshToken);
    const safeUser = toSafeUser(user);
    return buildAuthResponse(safeUser, refreshToken);
}
async function refreshSession(data) {
    if (!data.refreshToken) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Token de atualização não provido!");
    }
    const user = await findUserByRefreshToken(data.refreshToken);
    if (!user) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token de atualização inválido!");
    }
    const nextRefreshToken = (0, token_1.generateOpaqueToken)();
    await saveRefreshToken(user.id, nextRefreshToken);
    const safeUser = toSafeUser(user);
    return buildAuthResponse(safeUser, nextRefreshToken);
}
async function logout(data) {
    if (!data.refreshToken) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Token de atualização não provido!");
    }
    const user = await findUserByRefreshToken(data.refreshToken);
    if (!user) {
        return { message: "Sessão já limpada!" };
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            refreshTokenHash: null,
            refreshTokenExpiresAt: null,
        },
    });
    return { message: "Desconectado!" };
}
async function requestEmailVerification(data) {
    const email = normalizeEmail(data.email);
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, http_error_1.createHttpError)(404, "not_found", "Usuário não encontrado!");
    }
    if (user.emailVerifiedAt) {
        return { message: "E-mail já verificado!", verificationToken: "" };
    }
    const verificationToken = (0, token_1.generateOpaqueToken)();
    await saveEmailVerificationToken(user.id, verificationToken);
    return {
        message: "Token de verificação gerado!",
        verificationToken,
    };
}
async function verifyEmail(data) {
    if (!data.token) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Token de verificação não provido!");
    }
    const user = await findUserByEmailVerificationToken(data.token);
    if (!user) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token de verificação inválido!");
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            emailVerifiedAt: new Date(),
            emailVerificationTokenHash: null,
            emailVerificationTokenExpiresAt: null,
        },
    });
    return { message: "E-mail verificado!" };
}
async function requestPasswordReset(data) {
    const email = data.email?.trim();
    if (!email) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "E-mail não provido!");
    }
    const normalizedEmail = normalizeEmail(email);
    const user = await prisma_1.default.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
        return {
            message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição.",
        };
    }
    const resetCode = generateSixDigitCode();
    await savePasswordResetToken(user.id, resetCode);
    await (0, mailer_1.sendPasswordResetCodeEmail)(user.email, resetCode);
    return {
        message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição.",
    };
}
async function verifyResetCode(data) {
    const email = data.email?.trim();
    const code = data.code?.trim();
    if (!email || !code) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Campos requeríveis não preenchidos!");
    }
    if (!/^\d{6}$/.test(code)) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Código de redefinição inválido!");
    }
    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByPasswordResetCode(normalizedEmail, code);
    if (!user) {
        await registerInvalidPasswordResetCodeAttempt(normalizedEmail);
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Código de redefinição inválido ou expirado!");
    }
    const sessionToken = (0, token_1.generateOpaqueToken)();
    await savePasswordResetSessionToken(user.id, sessionToken);
    return {
        message: "Código de redefinição validado!",
        sessionToken,
    };
}
async function resetPassword(data) {
    if (!data.sessionToken || !data.password || !data.repeatPassword) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Campos requeríveis não preenchidos!");
    }
    if (data.password !== data.repeatPassword) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Senhas não coincidem!");
    }
    const user = await findUserByPasswordResetSessionToken(data.sessionToken);
    if (!user) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Sessão de redefinição inválida ou expirada!");
    }
    const passwordHash = await bcrypt_1.default.hash(data.password, 10);
    await prisma_1.default.user.update({
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
//# sourceMappingURL=service.js.map