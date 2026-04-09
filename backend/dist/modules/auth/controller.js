"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.refreshController = refreshController;
exports.logoutController = logoutController;
exports.requestEmailVerificationController = requestEmailVerificationController;
exports.verifyEmailController = verifyEmailController;
exports.requestPasswordResetController = requestPasswordResetController;
exports.resetPasswordController = resetPasswordController;
const service_1 = require("./service");
const auth_response_1 = require("../../lib/auth-response");
async function registerController(request, response, next) {
    try {
        const result = await (0, service_1.register)(request.body);
        (0, auth_response_1.sendSuccessResponse)(response, 201, result);
    }
    catch (error) {
        next(error);
    }
}
async function loginController(request, response, next) {
    try {
        const result = await (0, service_1.login)(request.body);
        (0, auth_response_1.sendSuccessResponse)(response, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function refreshController(request, response, next) {
    try {
        const result = await (0, service_1.refreshSession)(request.body);
        (0, auth_response_1.sendSuccessResponse)(response, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function logoutController(request, response, next) {
    try {
        const result = await (0, service_1.logout)(request.body);
        (0, auth_response_1.sendSuccessResponse)(response, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function requestEmailVerificationController(request, response, next) {
    try {
        const result = await (0, service_1.requestEmailVerification)(request.body);
        (0, auth_response_1.sendSuccessResponse)(response, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function verifyEmailController(request, response, next) {
    try {
        const result = await (0, service_1.verifyEmail)(request.body);
        (0, auth_response_1.sendSuccessResponse)(response, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function requestPasswordResetController(request, response, next) {
    try {
        const result = await (0, service_1.requestPasswordReset)(request.body);
        (0, auth_response_1.sendSuccessResponse)(response, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function resetPasswordController(request, response, next) {
    try {
        const result = await (0, service_1.resetPassword)(request.body);
        (0, auth_response_1.sendSuccessResponse)(response, 200, result);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map