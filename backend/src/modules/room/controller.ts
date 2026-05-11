import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getEnterpriseDashboard, getEnterpriseValues, getRoomOccupancy, getRoomsList, createRoomRental, getUserRentals, createRoom, getRoomDetailsById, RoomInfos, updateRoomById, UpdateRoom, toggleRoomAvailabilityById } from "./service";
import { sendSuccessResponse } from "../../lib/auth-response";
import { createHttpError } from "../../lib/http-error";
import prisma from "../../lib/prisma";

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

export async function createRoomController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		const user = await prisma.user.findUnique({
			where: { id: payload.sub },
			select: { accountType: true },
		});

		if (!user || user.accountType !== "ENTERPRISE") {
			throw createHttpError(403, "forbidden", "Apenas contas enterprise podem criar salas.");
		}

		const room = await createRoom({
			enterpriseOwnerId: payload.sub,
			roomName: request.body.roomName,
			roomImage: request.body.roomImage,
			floor: request.body.floor,
			area: request.body.area,
			characteristics: request.body.characteristics,
			pricePerHour: request.body.pricePerHour,
			priceWeek: request.body.priceWeek,
			pricePerMonth: request.body.pricePerMonth,
			items: Array.isArray(request.body.items) ? request.body.items : [],
			customItems: Array.isArray(request.body.customItems) ? request.body.customItems : [],
		});

		sendSuccessResponse(response, 201, room);
	} catch (error) {
		next(error);
	}
}

export async function enterpriseDashboardController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		const dashboard = await getEnterpriseDashboard(payload.sub);

		sendSuccessResponse(response, 200, dashboard);
	} catch (error) {
		next(error);
	}
}

export async function roomOccupancyController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		
		const token = getTokenFromHeader(request.headers.authorization);
		jwt.verify(token, getJwtSecret()) as AuthPayload;
		const roomId = request.params.roomId;

		if (!roomId) return;

		const occupancy = await getRoomOccupancy(roomId as string);

		sendSuccessResponse(response, 200, occupancy);
	} catch (error) {
		next(error);
	}
}

export async function createRentalController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;

		const rental = await createRoomRental({
			...request.body,
			professionalId: payload.sub,
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

export async function getRoomDetailsController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		const roomId = request.params.roomId;

		if (!payload.sub) createHttpError(403, 'forbidden', 'Não autenticado');
		if (!roomId) createHttpError(403, 'forbidden', 'Sala não encotrada');

		const details = await getRoomDetailsById(roomId as string);

		sendSuccessResponse(response, 200, details);
	} catch (error) {
		next(error);
	}
}

export async function toggleRoomAvailabilityController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		const roomId = request.params.roomId;
		const { status }: { status: boolean} = request.body;

		if (!payload.sub) {
			throw createHttpError(403, 'forbidden', 'Não autenticado');
		}

		if (!roomId) {
			throw createHttpError(403, 'forbidden', 'Sala não encontrada');
		}

		await toggleRoomAvailabilityById(roomId as string, status);

		sendSuccessResponse(response, 200, { success: true });
	} catch (error) {
		next(error);
	}
}

export async function updateRoomController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		const roomId = request.params.roomId;
		const data: UpdateRoom = request.body;

		if (!payload.sub) {
			throw createHttpError(403, 'forbidden', 'Não autenticado');
		}

		if (!roomId) {
			throw createHttpError(403, 'forbidden', 'Sala não encontrada');
		}

		await updateRoomById(roomId as string, data);

		sendSuccessResponse(response, 200, { success: true });
	} catch (error) {
		next(error);
	}
}

export async function enterpriseValuesController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = getTokenFromHeader(request.headers.authorization);
		const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
		const values = await getEnterpriseValues(payload.sub);

		sendSuccessResponse(response, 200, values);
	} catch (error) {
		next(error);
	}
}
