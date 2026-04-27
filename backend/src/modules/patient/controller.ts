import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { createPatient, getActivePatients, getPatientById, getPatientHistory } from "./service";
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
		throw createHttpError(401, "unauthorized", "Cabecalho de autorizacao e requerivel!");
	}

	const [scheme, token] = authHeader.split(" ");

	if (scheme !== "Bearer" || !token) {
		throw createHttpError(401, "unauthorized", "Cabecalho de autorizacao invalido!");
	}

	return token;
}

function getJwtSecret(): string {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw createHttpError(500, "internal_server_error", "JWT_SECRET nao configurado!");
	}

	return secret;
}

function getAuthPayload(request: Request): AuthPayload {
	const token = getTokenFromHeader(request.headers.authorization);
	return jwt.verify(token, getJwtSecret()) as AuthPayload;
}

function parseLimit(rawLimit: unknown): number | undefined {
	if (typeof rawLimit !== "string" || rawLimit.trim() === "") {
		return undefined;
	}

	const parsedLimit = Number(rawLimit);

	if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
		throw createHttpError(400, "bad_request", "Parametro limit invalido.");
	}

	return parsedLimit;
}

export async function listActivePatientsController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const payload = getAuthPayload(request);
		const limit = parseLimit(request.query.limit);
		const patients = await getActivePatients(payload.sub, limit);

		sendSuccessResponse(response, 200, patients);
	} catch (error) {
		next(error);
	}
}

export async function listPatientHistoryController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const payload = getAuthPayload(request);
		const limit = parseLimit(request.query.limit);
		const history = await getPatientHistory(payload.sub, limit);

		sendSuccessResponse(response, 200, history);
	} catch (error) {
		next(error);
	}
}

export async function getPatientByIdController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const payload = getAuthPayload(request);
		const patientId = request.params.id;

		if (!patientId) {
			throw createHttpError(400, "bad_request", "Parametro id invalido.");
		}

		const patient = await getPatientById(payload.sub, patientId);

		if (!patient) {
			throw createHttpError(404, "not_found", "Paciente nao encontrado.");
		}

		sendSuccessResponse(response, 200, patient);
	} catch (error) {
		next(error);
	}
}

export async function createPatientController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const payload = getAuthPayload(request);
		const patient = await createPatient(payload.sub, request.body);

		sendSuccessResponse(response, 201, patient);
	} catch (error) {
		next(error);
	}
}
