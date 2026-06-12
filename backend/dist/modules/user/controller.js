"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const service_1 = require("./service");
const auth_response_1 = require("../../lib/auth-response");
const http_error_1 = require("../../lib/http-error");
const getJwtSecret_util_1 = require("../../utils/getJwtSecret.util");
const getTokenFromHeader_util_1 = require("../../utils/getTokenFromHeader.util");
class UserController {
    static async me(request, response, next) {
        try {
            const token = (0, getTokenFromHeader_util_1.getTokenFromHeader)(request.headers.authorization);
            let payload;
            try {
                payload = jsonwebtoken_1.default.verify(token, (0, getJwtSecret_util_1.getJwtSecret)());
            }
            catch (err) {
                throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token inválido ou expirado.");
            }
            const user = await service_1.UserService.getProfileById(payload.sub);
            if (!user) {
                throw (0, http_error_1.createHttpError)(404, "not_found", "Usuário não encontrado!");
            }
            (0, auth_response_1.sendSuccessResponse)(response, 200, user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMe(request, response, next) {
        try {
            const token = (0, getTokenFromHeader_util_1.getTokenFromHeader)(request.headers.authorization);
            let payload;
            try {
                payload = jsonwebtoken_1.default.verify(token, (0, getJwtSecret_util_1.getJwtSecret)());
            }
            catch (err) {
                throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token inválido ou expirado.");
            }
            const user = await service_1.UserService.updateProfileById(payload.sub, request.body);
            if (!user) {
                throw (0, http_error_1.createHttpError)(404, "not_found", "Usuário não encontrado!");
            }
            (0, auth_response_1.sendSuccessResponse)(response, 200, user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMeImage(request, response, next) {
        try {
            const token = (0, getTokenFromHeader_util_1.getTokenFromHeader)(request.headers.authorization);
            let payload;
            try {
                payload = jsonwebtoken_1.default.verify(token, (0, getJwtSecret_util_1.getJwtSecret)());
            }
            catch (err) {
                throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token inválido ou expirado.");
            }
            const displayImage = request.body.profileImage ?? null;
            const user = await service_1.UserService.updateProfileImageById(payload.sub, displayImage);
            if (!user) {
                throw (0, http_error_1.createHttpError)(404, "not_found", "Usuário não encontrado!");
            }
            (0, auth_response_1.sendSuccessResponse)(response, 200, user);
        }
        catch (error) {
            next(error);
        }
    }
    static async storePaymentToPaymentHistory(request, response, next) {
        try {
            const token = (0, getTokenFromHeader_util_1.getTokenFromHeader)(request.headers.authorization);
            let payload;
            try {
                payload = jsonwebtoken_1.default.verify(token, (0, getJwtSecret_util_1.getJwtSecret)());
            }
            catch (err) {
                throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token inválido ou expirado.");
            }
            const historyCreated = await service_1.UserService.storePaymentHistory(request.body);
            if (!historyCreated) {
                throw (0, http_error_1.createHttpError)(500, "internal_server_error", "Não foi possível guardar o histórico do pagamento");
            }
            (0, auth_response_1.sendSuccessResponse)(response, 200, historyCreated);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfessionalPaymentHistory(request, response, next) {
        try {
            const token = (0, getTokenFromHeader_util_1.getTokenFromHeader)(request.headers.authorization);
            let payload;
            const professionalId = request.params.id;
            try {
                payload = jsonwebtoken_1.default.verify(token, (0, getJwtSecret_util_1.getJwtSecret)());
            }
            catch (err) {
                throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token inválido ou expirado.");
            }
            const historyGot = await service_1.UserService.getProfessionalPaymentsHistory(professionalId);
            if (!historyGot) {
                throw (0, http_error_1.createHttpError)(500, "internal_server_error", "Não foi possível guardar o histórico do pagamento");
            }
            (0, auth_response_1.sendSuccessResponse)(response, 200, historyGot);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyCurrentPasswordMatch(request, response, next) {
        try {
            const token = (0, getTokenFromHeader_util_1.getTokenFromHeader)(request.headers.authorization);
            let payload;
            const professionalId = request.params.professionalId;
            const currentPassword = request.body.currentPassword;
            try {
                payload = jsonwebtoken_1.default.verify(token, (0, getJwtSecret_util_1.getJwtSecret)());
            }
            catch (err) {
                throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token inválido ou expirado.");
            }
            const match = await service_1.UserService.verifyCurrentPasswordMatchById(professionalId, currentPassword);
            (0, auth_response_1.sendSuccessResponse)(response, 200, match);
        }
        catch (error) {
            next(error);
        }
    }
    static async changeProfessionalPassword(request, response, next) {
        try {
            const token = (0, getTokenFromHeader_util_1.getTokenFromHeader)(request.headers.authorization);
            let payload;
            const professionalId = request.params.professionalId;
            const newPassword = request.body.newPassword;
            try {
                payload = jsonwebtoken_1.default.verify(token, (0, getJwtSecret_util_1.getJwtSecret)());
            }
            catch (err) {
                throw (0, http_error_1.createHttpError)(401, "unauthorized", "Token inválido ou expirado.");
            }
            await service_1.UserService.changeProfessionalPasswordById(professionalId, newPassword);
            (0, auth_response_1.sendSuccessResponse)(response, 200, { message: 'Sucesso ao atualizar a senha!' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=controller.js.map