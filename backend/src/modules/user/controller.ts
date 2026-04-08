import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getProfileById } from "./service";
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
		throw createHttpError(401, "unauthorized", "Authorization header is required");
	}

	const [scheme, token] = authHeader.split(" ");

	if (scheme !== "Bearer" || !token) {
		throw createHttpError(401, "unauthorized", "Invalid authorization header");
	}

	return token;
}

function getJwtSecret(): string {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw createHttpError(500, "internal_server_error", "JWT_SECRET not configured");
	}

	return secret;
}

export async function meController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;

		const user = await getProfileById(payload.sub);

		if (!user) {
			throw createHttpError(404, "not_found", "User not found");
		}

		sendSuccessResponse(response, 200, user);
	} catch (error) {
		next(error);
	}
}
