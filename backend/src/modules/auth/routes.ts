import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
	loginController,
	logoutController,
	refreshController,
	registerController,
	requestEmailVerificationController,
	requestPasswordResetController,
	resetPasswordController,
	verifyEmailController,
} from "./controller";

const authRoutes = Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
});

authRoutes.use(authLimiter);

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/refresh", refreshController);
authRoutes.post("/logout", logoutController);
authRoutes.post("/request-email-verification", requestEmailVerificationController);
authRoutes.post("/verify-email", verifyEmailController);
authRoutes.post("/request-password-reset", requestPasswordResetController);
authRoutes.post("/reset-password", resetPasswordController);

export default authRoutes;
