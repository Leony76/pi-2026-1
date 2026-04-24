import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getRoomsList, createRoomRental, getUserRentals } from "./service";
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

export async function listRoomsController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const rooms = await getRoomsList();

		sendSuccessResponse(response, 200, rooms);
	} catch (error) {
		next(error);
	}
}

export async function createRentalController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;

		const rental = await createRoomRental({
			professionalId: payload.sub,
			...request.body,
		});

		sendSuccessResponse(response, 201, rental);
	} catch (error) {
		next(error);
	}
}

export async function getUserRentalsController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;

		const rentals = await getUserRentals(payload.sub);

		sendSuccessResponse(response, 200, rentals);
	} catch (error) {
		next(error);
	}
}
