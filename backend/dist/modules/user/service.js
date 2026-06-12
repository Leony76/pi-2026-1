"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_error_1 = require("../../lib/http-error");
const bcrypt_1 = __importDefault(require("bcrypt"));
const repository_1 = require("./repository");
const buildProfile_mapper_1 = require("./mapper/buildProfile.mapper");
class UserService {
    static async buildProfileResponse(userId) {
        const user = await repository_1.UserRepository.getUserInfosById(userId);
        if (!user)
            return null;
        const { rentals, patients, sessions, } = await repository_1.UserRepository.getUserSessionsRentalsAndPatients(userId);
        return (0, buildProfile_mapper_1.buildProfileMapper)(user, sessions, patients, rentals);
    }
    static async getProfileById(userId) {
        return this.buildProfileResponse(userId);
    }
    static async updateProfileImageById(userId, displayImage) {
        await repository_1.UserRepository.updateProfileImageById(userId, displayImage);
        return this.buildProfileResponse(userId);
    }
    static async storePaymentHistory(data) {
        return await repository_1.UserRepository.storePaymentHistory(data);
    }
    static async getProfessionalPaymentsHistory(id) {
        return await repository_1.UserRepository.getProfessionalPaymentsHistory(id);
    }
    static async verifyCurrentPasswordMatchById(professionalId, currentPassword) {
        const user = await repository_1.UserRepository.getUserById(professionalId);
        if (!user) {
            throw (0, http_error_1.createHttpError)(401, "unauthorized", "Usuário não existe!");
        }
        const passwordIsValid = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
        if (!passwordIsValid)
            return false;
        return true;
    }
    static async changeProfessionalPasswordById(professionalId, newPassword) {
        const user = await repository_1.UserRepository.getUserById(professionalId);
        if (!user) {
            throw (0, http_error_1.createHttpError)(401, "unauthorized", "Usuário não existe!");
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        return await repository_1.UserRepository.changeProfessionalPasswordById(professionalId, hashedPassword);
    }
    static async updateProfileById(userId, data) {
        const name = data.name.trim();
        const specialty = data.specialty.trim();
        const crmCrp = data.crmCrp.trim().toUpperCase();
        const email = data.email.trim().toLowerCase();
        const phone = data.phone.trim();
        if (name.length < 3) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Nome invalido.");
        }
        if (!specialty) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Especialidade invalida.");
        }
        if (!/^\d{5}-[A-Z]{2}$/.test(crmCrp)) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Formato de CRM/CRP invalido.");
        }
        if (!email) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "E-mail invalido.");
        }
        if (!/^\([1-9]{2}\) [0-9]{4,5}-[0-9]{4}$/.test(phone) && phone) {
            throw (0, http_error_1.createHttpError)(400, "bad_request", "Formato de telefone invalido.");
        }
        await repository_1.UserRepository.updateProfileById(userId, name, specialty, crmCrp, email, phone, data);
        return this.buildProfileResponse(userId);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=service.js.map