"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const controller_1 = require("./controller");
const authRoutes = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
});
authRoutes.use(authLimiter);
authRoutes.post("/register", controller_1.AuthController.register);
authRoutes.post("/login", controller_1.AuthController.login);
authRoutes.post("/refresh", controller_1.AuthController.refresh);
authRoutes.post("/logout", controller_1.AuthController.logout);
authRoutes.post("/request-email-verification", controller_1.AuthController.requestEmailVerification);
authRoutes.post("/verify-email", controller_1.AuthController.verifyEmail);
authRoutes.post("/request-password-reset", controller_1.AuthController.requestPasswordReset);
authRoutes.post("/verify-reset-code", controller_1.AuthController.verifyResetCode);
authRoutes.post("/reset-password", controller_1.AuthController.resetPassword);
exports.default = authRoutes;
//# sourceMappingURL=routes.js.map