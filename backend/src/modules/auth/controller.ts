import { Request, Response, NextFunction } from "express";
import { AuthService } from "./service";
import { sendSuccessResponse } from "../../lib/auth-response";

export class AuthController {

	public static async register(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.register(request.body);

			sendSuccessResponse(response, 201, result);
		} catch (error:unknown) {
			next(error);
		}
	}
	


	public static async login(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.login(request.body);

			sendSuccessResponse(response, 200, result);
		} catch (error:unknown) {
			next(error);
		}
	}
	


	public static async refresh(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.refreshSession(request.body);

			sendSuccessResponse(response, 200, result);
		} catch (error:unknown) {
			next(error);
		}
	}
	


	public static async logout(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.logout(request.body);

			sendSuccessResponse(response, 200, result);
		} catch (error:unknown) {
			next(error);
		}
	}


	
	public static async requestEmailVerification(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.requestEmailVerification(request.body);

			sendSuccessResponse(response, 200, result);
		} catch (error:unknown) {
			next(error);
		}
	}
	


	public static async verifyEmail(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.verifyEmail(request.body);

			sendSuccessResponse(response, 200, result);
		} catch (error:unknown) {
			next(error);
		}
	}
	


	public static async requestPasswordReset(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.requestPasswordReset(request.body);

			sendSuccessResponse(response, 200, result);
		} catch (error:unknown) {
			next(error);
		}
	}
	


	public static async verifyResetCode(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.verifyResetCode(request.body);

			sendSuccessResponse(response, 200, result);
		} catch (error:unknown) {
			next(error);
		}
	}
	


	public static async resetPassword(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await AuthService.resetPassword(request.body);

			sendSuccessResponse(response, 200, result);
		} catch (error:unknown) {
			next(error);
		}
	}
}

