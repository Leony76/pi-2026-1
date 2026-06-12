"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const service_1 = require("./service");
const auth_response_1 = require("../../lib/auth-response");
class AuthController {
    static async register(request, response, next) {
        try {
            const result = await service_1.AuthService.register(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 201, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(request, response, next) {
        try {
            const result = await service_1.AuthService.login(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 200, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(request, response, next) {
        try {
            const result = await service_1.AuthService.refreshSession(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 200, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(request, response, next) {
        try {
            const result = await service_1.AuthService.logout(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 200, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async requestEmailVerification(request, response, next) {
        try {
            const result = await service_1.AuthService.requestEmailVerification(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 200, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyEmail(request, response, next) {
        try {
            const result = await service_1.AuthService.verifyEmail(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 200, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async requestPasswordReset(request, response, next) {
        try {
            const result = await service_1.AuthService.requestPasswordReset(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 200, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyResetCode(request, response, next) {
        try {
            const result = await service_1.AuthService.verifyResetCode(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 200, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(request, response, next) {
        try {
            const result = await service_1.AuthService.resetPassword(request.body);
            (0, auth_response_1.sendSuccessResponse)(response, 200, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=controller.js.map