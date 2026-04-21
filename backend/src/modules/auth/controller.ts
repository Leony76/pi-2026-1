import { Request, Response, NextFunction } from "express";

import {
	login,
	logout,
	refreshSession,
	register,
	requestEmailVerification,
	requestPasswordReset,
	resetPassword,
	verifyResetCode,
	verifyEmail,
} from "./service";
import { sendSuccessResponse } from "../../lib/auth-response";

export async function registerController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await register(request.body);
		sendSuccessResponse(response, 201, result);
	} catch (error) {
		next(error);
	}
}

export async function loginController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await login(request.body);
		sendSuccessResponse(response, 200, result);
	} catch (error) {
		next(error);
	}
}

export async function refreshController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await refreshSession(request.body);
		sendSuccessResponse(response, 200, result);
	} catch (error) {
		next(error);
	}
}

export async function logoutController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await logout(request.body);
		sendSuccessResponse(response, 200, result);
	} catch (error) {
		next(error);
	}
}

export async function requestEmailVerificationController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await requestEmailVerification(request.body);
		sendSuccessResponse(response, 200, result);
	} catch (error) {
		next(error);
	}
}

export async function verifyEmailController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await verifyEmail(request.body);
		sendSuccessResponse(response, 200, result);
	} catch (error) {
		next(error);
	}
}

export async function requestPasswordResetController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await requestPasswordReset(request.body);
		sendSuccessResponse(response, 200, result);
	} catch (error) {
		next(error);
	}
}

export async function verifyResetCodeController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await verifyResetCode(request.body);
		sendSuccessResponse(response, 200, result);
	} catch (error) {
		next(error);
	}
}

export async function resetPasswordController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await resetPassword(request.body);
		sendSuccessResponse(response, 200, result);
	} catch (error) {
		next(error);
	}
}
