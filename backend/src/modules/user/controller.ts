import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "./service";
import { sendSuccessResponse } from "../../lib/auth-response";
import { createHttpError } from "../../lib/http-error";
import { getJwtSecret } from "../../utils/getJwtSecret.util";
import { getTokenFromHeader } from "../../utils/getTokenFromHeader.util";

type AuthPayload = {
	sub: string;
	email: string;
	iat: number;
	exp: number;
};

export class UserController {

	public static async me(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			let payload: AuthPayload;
		try {
			payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		} catch (err: unknown) {
			throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
		}
	
			const user = await UserService.getProfileById(payload.sub);
	
			if (!user) {
				throw createHttpError(404, "not_found", "Usuário não encontrado!");
			}
	
			sendSuccessResponse(response, 200, user);
		} catch (error) {
			next(error);
		}
	}
	


	public static async updateMe(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			let payload: AuthPayload;
		try {
			payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		} catch (err) {
			throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
		}
	
			const user = await UserService.updateProfileById(payload.sub, request.body);
	
			if (!user) {
				throw createHttpError(404, "not_found", "Usuário não encontrado!");
			}
	
			sendSuccessResponse(response, 200, user);
		} catch (error) {
			next(error);
		}
	}
	


	public static async updateMeImage(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			let payload: AuthPayload;
			try {
				payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			} catch (err) {
				throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
			}
	
			const displayImage = request.body.profileImage ?? null;
	
			const user = await UserService.updateProfileImageById(payload.sub, displayImage);
	
			if (!user) {
				throw createHttpError(404, "not_found", "Usuário não encontrado!");
			}
	
			sendSuccessResponse(response, 200, user);
		} catch (error) {
			next(error);
		}
	}
	


	public static async storePaymentToPaymentHistory(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			let payload: AuthPayload;
	
			try {
				payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			} catch (err) {
				throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
			}
	
			const historyCreated = await UserService.storePaymentHistory(request.body);
	
			if (!historyCreated) {
				throw createHttpError(500, "internal_server_error", "Não foi possível guardar o histórico do pagamento");
			}
	
			sendSuccessResponse(response, 200, historyCreated);
		} catch (error) {
			next(error);
		}
	}
	


	public static async getProfessionalPaymentHistory(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			let payload: AuthPayload;
			const professionalId = request.params.id as string;
	
			try {
				payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			} catch (err) {
				throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
			}
	
			const historyGot = await UserService.getProfessionalPaymentsHistory(professionalId);
	
			if (!historyGot) {
				throw createHttpError(500, "internal_server_error", "Não foi possível guardar o histórico do pagamento");
			}
	
			sendSuccessResponse(response, 200, historyGot);
		} catch (error) {
			next(error);
		}
	}
	


	public static async verifyCurrentPasswordMatch(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			let payload: AuthPayload;
	
			const professionalId = request.params.professionalId as string;
			const currentPassword = request.body.currentPassword as string;
	
			try {
				payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			} catch (err) {
				throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
			}
	
			const match: boolean = await UserService.verifyCurrentPasswordMatchById(
				professionalId,
				currentPassword,
			);
	
			sendSuccessResponse(response, 200, match);
		} catch (error) {
			next(error);
		}
	}
	


	public static async changeProfessionalPassword(request: Request, response: Response, next: NextFunction) {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			let payload: AuthPayload;
	
			const professionalId = request.params.professionalId as string;
			const newPassword = request.body.newPassword as string;
	
			try {
				payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			} catch (err) {
				throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
			}
			
			await UserService.changeProfessionalPasswordById(
				professionalId,
				newPassword,
			);
	
			sendSuccessResponse(response, 200, { message: 'Sucesso ao atualizar a senha!' });
		} catch (error) {
			next(error);
		}
	}
}



