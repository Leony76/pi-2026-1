"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const http_error_1 = require("../../lib/http-error");
const mailer_1 = require("../../lib/mailer");
const token_1 = require("../../lib/token");
const normalizeSpecialty_util_1 = require("../../utils/normalizeSpecialty.util");
const normalizeCrpCrp_util_1 = require("../../utils/normalizeCrpCrp.util");
const normalizeEmail_util_1 = require("../../utils/normalizeEmail.util");
const buildAuthResponse_util_1 = require("../../utils/buildAuthResponse.util");
const toSafeUser_type_1 = require("../../utils/toSafeUser.type");
const generateSixDigitCode_util_1 = require("../../utils/generateSixDigitCode.util");
const repository_1 = require("./repository");
const registerPayload_mapper_1 = require("./mapper/registerPayload.mapper");
class AuthService {
    static async register(data) {
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
        const normalizedEmail = (0, normalizeEmail_util_1.normalizeEmail)(email);
        const normalizedCrmCrp = (0, normalizeCrpCrp_util_1.normalizeCrmCrp)(crmCrp);
        const normalizedSpecialty = (0, normalizeSpecialty_util_1.normalizeSpecialty)(specialty);
        const existingUser = await repository_1.AuthRepository.existingUserByCrpOrEmail(normalizedEmail, normalizedCrmCrp);
        if (existingUser) {
            throw (0, http_error_1.createHttpError)(409, "conflict", "Usuário com esse e-mail ou CRM/CRP já existe!");
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        const refreshToken = (0, token_1.generateOpaqueToken)();
        const emailVerificationToken = (0, token_1.generateOpaqueToken)();
        const registerPayload = (0, registerPayload_mapper_1.registerPayloadMapper)(name, normalizedSpecialty, normalizedCrmCrp, normalizedEmail, passwordHash, emailVerificationToken, refreshToken);
        const user = await repository_1.AuthRepository.register(registerPayload);
        return (0, buildAuthResponse_util_1.buildAuthResponse)((0, toSafeUser_type_1.toSafeUser)(user), refreshToken, emailVerificationToken);
    }
    static async login(data) {
        const email = data.email?.trim();
        if (!email || !data.password) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "E-mail ou senha não providos!");
        }
        const normalizedEmail = (0, normalizeEmail_util_1.normalizeEmail)(email);
        const user = await repository_1.AuthRepository.findUserByEmail(normalizedEmail);
        if (!user) {
            throw (0, http_error_1.createHttpError)(401, "unauthorized", "Credenciais inválidas!");
        }
        const passwordIsValid = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!passwordIsValid) {
            throw (0, http_error_1.createHttpError)(401, "unauthorized", "Credenciais inválidas!");
        }
        const refreshToken = (0, token_1.generateOpaqueToken)();
        await repository_1.AuthRepository.saveRefreshToken(user.id, refreshToken);
        const safeUser = (0, toSafeUser_type_1.toSafeUser)(user);
        return (0, buildAuthResponse_util_1.buildAuthResponse)(safeUser, refreshToken);
    }
    static async refreshSession(data) {
        if (!data.refreshToken) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Token de atualização não provido!");
        }
        const user = await repository_1.AuthRepository.findUserByRefreshToken(data.refreshToken);
        if (!user) {
            throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token de atualização inválido!");
        }
        const nextRefreshToken = (0, token_1.generateOpaqueToken)();
        await repository_1.AuthRepository.saveRefreshToken(user.id, nextRefreshToken);
        const safeUser = (0, toSafeUser_type_1.toSafeUser)(user);
        return (0, buildAuthResponse_util_1.buildAuthResponse)(safeUser, nextRefreshToken);
    }
    static async logout(data) {
        if (!data.refreshToken) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Token de atualização não provido!");
        }
        const user = await repository_1.AuthRepository.findUserByRefreshToken(data.refreshToken);
        if (!user) {
            return { message: "Sessão já limpada!" };
        }
        await repository_1.AuthRepository.logout(user.id);
        return { message: "Desconectado!" };
    }
    static async requestEmailVerification(data) {
        const email = (0, normalizeEmail_util_1.normalizeEmail)(data.email);
        const user = await repository_1.AuthRepository.findUserByEmail(email);
        if (!user) {
            throw (0, http_error_1.createHttpError)(404, "not_found", "Usuário não encontrado!");
        }
        if (user.emailVerifiedAt) {
            return { message: "E-mail já verificado!", verificationToken: "" };
        }
        const verificationToken = (0, token_1.generateOpaqueToken)();
        await repository_1.AuthRepository.saveEmailVerificationToken(user.id, verificationToken);
        return {
            message: "Token de verificação gerado!",
            verificationToken,
        };
    }
    static async verifyEmail(data) {
        if (!data.token) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Token de verificação não provido!");
        }
        const user = await repository_1.AuthRepository.findUserByEmailVerificationToken(data.token);
        if (!user) {
            throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token de verificação inválido!");
        }
        await repository_1.AuthRepository.verifyEmail(user.id);
        return { message: "E-mail verificado!" };
    }
    static async requestPasswordReset(data) {
        const email = data.email?.trim();
        if (!email) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "E-mail não provido!");
        }
        const normalizedEmail = (0, normalizeEmail_util_1.normalizeEmail)(email);
        const user = await prisma_1.default.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            return { message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição." };
        }
        const resetCode = (0, generateSixDigitCode_util_1.generateSixDigitCode)();
        await repository_1.AuthRepository.savePasswordResetToken(user.id, resetCode);
        await (0, mailer_1.sendPasswordResetCodeEmail)(user.email, resetCode);
        return {
            message: "Se esse e-mail estiver cadastrado, enviaremos um código de redefinição.",
        };
    }
    static async verifyResetCode(data) {
        const email = data.email?.trim();
        const code = data.code?.trim();
        if (!email || !code) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Campos requeríveis não preenchidos!");
        }
        if (!/^\d{6}$/.test(code)) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Código de redefinição inválido!");
        }
        const normalizedEmail = (0, normalizeEmail_util_1.normalizeEmail)(email);
        const user = await repository_1.AuthRepository.findUserByPasswordResetCode(normalizedEmail, code);
        if (!user) {
            await repository_1.AuthRepository.registerInvalidPasswordResetCodeAttempt(normalizedEmail);
            throw (0, http_error_1.createHttpError)(401, "unauthorized", "Código de redefinição inválido ou expirado!");
        }
        const sessionToken = (0, token_1.generateOpaqueToken)();
        await repository_1.AuthRepository.savePasswordResetSessionToken(user.id, sessionToken);
        return {
            message: "Código de redefinição validado!",
            sessionToken,
        };
    }
    static async resetPassword(data) {
        if (!data.sessionToken || !data.password || !data.repeatPassword) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Campos requeríveis não preenchidos!");
        }
        if (data.password !== data.repeatPassword) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Senhas não coincidem!");
        }
        const user = await repository_1.AuthRepository.findUserByPasswordResetSessionToken(data.sessionToken);
        if (!user) {
            throw (0, http_error_1.createHttpError)(401, "unauthorized", "Sessão de redefinição inválida ou expirada!");
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        await repository_1.AuthRepository.resetPassword(user.id, passwordHash);
        return { message: "Senha redefinida!" };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=service.js.map