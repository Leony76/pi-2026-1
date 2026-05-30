import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./controller";

const authRoutes = Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
});

authRoutes.use(authLimiter);

authRoutes.post("/register"                   , AuthController.register);
authRoutes.post("/login"                      , AuthController.login);
authRoutes.post("/refresh"                    , AuthController.refresh);
authRoutes.post("/logout"                     , AuthController.logout);
authRoutes.post("/request-email-verification" , AuthController.requestEmailVerification);
authRoutes.post("/verify-email"               , AuthController.verifyEmail);
authRoutes.post("/request-password-reset"     , AuthController.requestPasswordReset);
authRoutes.post("/verify-reset-code"          , AuthController.verifyResetCode);
authRoutes.post("/reset-password"             , AuthController.resetPassword);

export default authRoutes;
