import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { changeProfessionalPasswordById, getProfessionalPaymentsHistory, getProfileById, storePaymentHistory, updateProfileById, updateProfileImageById, verifyCurrentPasswordMatchById } from "./service";
import { sendSuccessResponse } from "../../lib/auth-response";
import { createHttpError } from "../../lib/http-error";

type AuthPayload = {
	sub: string;
	email: string;
	iat: number;
	exp: number;
};

function getTokenFromHeader(authHeader?: string): string {
	if (!authHeader) {
		throw createHttpError(401, "unauthorized", "Cabeçalho de autorização é requerível!");
	}

	const [scheme, token] = authHeader.split(" ");

	if (scheme !== "Bearer" || !token) {
		throw createHttpError(401, "unauthorized", "Cabeçalho de autorização inválido!");
	}

	return token;
}

function getJwtSecret(): string {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw createHttpError(500, "internal_server_error", "JWT_SECRET não configurado!");
	}

	return secret;
}

export async function meController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
	let payload: AuthPayload;
	try {
		payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
	} catch (err) {
		throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
	}

		const user = await getProfileById(payload.sub);

		if (!user) {
			throw createHttpError(404, "not_found", "Usuário não encontrado!");
		}

		sendSuccessResponse(response, 200, user);
	} catch (error) {
		next(error);
	}
}

export async function updateMeController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		let payload: AuthPayload;
	try {
		payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
	} catch (err) {
		throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
	}

		const user = await updateProfileById(payload.sub, request.body);

		if (!user) {
			throw createHttpError(404, "not_found", "Usuário não encontrado!");
		}

		sendSuccessResponse(response, 200, user);
	} catch (error) {
		next(error);
	}}

export async function updateMeImageController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		let payload: AuthPayload;
		try {
			payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		} catch (err) {
			throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
		}

		const displayImage = request.body.profileImage ?? null;

		const user = await updateProfileImageById(payload.sub, displayImage);

		if (!user) {
			throw createHttpError(404, "not_found", "Usuário não encontrado!");
		}

		sendSuccessResponse(response, 200, user);
	} catch (error) {
		next(error);
	}}

export async function storePaymentToPaymentHistoryController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		let payload: AuthPayload;

		try {
			payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		} catch (err) {
			throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
		}

		const historyCreated = await storePaymentHistory(request.body);

		if (!historyCreated) {
			throw createHttpError(500, "internal_server_error", "Não foi possível guardar o histórico do pagamento");
		}

		sendSuccessResponse(response, 200, historyCreated);
	} catch (error) {
		next(error);
	}
}

export async function getProfessionalPaymentHistoryController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		let payload: AuthPayload;
		const professionalId = request.params.id as string;

		try {
			payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		} catch (err) {
			throw createHttpError(401, "unauthorized", "Token inválido ou expirado.");
		}

		const historyGot = await getProfessionalPaymentsHistory(professionalId);

		if (!historyGot) {
			throw createHttpError(500, "internal_server_error", "Não foi possível guardar o histórico do pagamento");
		}

		sendSuccessResponse(response, 200, historyGot);
	} catch (error) {
		next(error);
	}
}

export async function verifyCurrentPasswordMatchController(request: Request, response: Response, next: NextFunction): Promise<void> {
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

		const match: boolean = await verifyCurrentPasswordMatchById(
			professionalId,
			currentPassword,
		);

		sendSuccessResponse(response, 200, match);
	} catch (error) {
		next(error);
	}
}

export async function changeProfessionalPasswordController(request: Request, response: Response, next: NextFunction) {
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
		
		await changeProfessionalPasswordById(
			professionalId,
			currentPassword,
		);

		sendSuccessResponse(response, 200, { message: 'Sucesso ao atualizar a senha!' });
	} catch (error) {
		next(error);
	}
}

