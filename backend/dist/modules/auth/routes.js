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
authRoutes.post("/register", controller_1.registerController);
authRoutes.post("/login", controller_1.loginController);
authRoutes.post("/refresh", controller_1.refreshController);
authRoutes.post("/logout", controller_1.logoutController);
authRoutes.post("/request-email-verification", controller_1.requestEmailVerificationController);
authRoutes.post("/verify-email", controller_1.verifyEmailController);
authRoutes.post("/request-password-reset", controller_1.requestPasswordResetController);
authRoutes.post("/reset-password", controller_1.resetPasswordController);
exports.default = authRoutes;
//# sourceMappingURL=routes.js.map