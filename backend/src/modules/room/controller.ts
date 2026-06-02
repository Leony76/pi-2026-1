import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RoomService } from "./service";
import { sendSuccessResponse } from "../../lib/auth-response";
import { createHttpError } from "../../lib/http-error";
import { AuthPayload } from "../../types/auth/authPayload.type";
import { getTokenFromHeader } from "../../utils/getTokenFromHeader.util";
import { getJwtSecret } from "../../utils/getJwtSecret.util";
import { UpdateRoom } from "../../types/room/updateRoom.type";
import { requestCreateRoomPayloadMapper } from "./mappers/createRoomPayload.mapper";

export class RoomController {

	public static async listRooms(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const rooms = await RoomService.getRoomsList();
	
			sendSuccessResponse(response, 200, rooms);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async createRoom(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			
			const roomPayload = requestCreateRoomPayloadMapper(request, payload);

			const room = await RoomService.createRoom(payload, roomPayload);
	
			sendSuccessResponse(response, 201, room);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async enterpriseDashboard(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			const dashboard = await RoomService.getEnterpriseDashboard(payload.sub);
	
			sendSuccessResponse(response, 200, dashboard);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async roomOccupancy(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			
			const token = getTokenFromHeader(request.headers.authorization);
			jwt.verify(token, getJwtSecret()) as AuthPayload;
			const roomId = request.params.roomId;
	
			if (!roomId) return;
	
			const occupancy = await RoomService.getRoomOccupancy(roomId as string);
	
			sendSuccessResponse(response, 200, occupancy);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async createRental(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
	
			const rental = await RoomService.createRoomRental({
				...request.body,
				professionalId: payload.sub,
			});
	
			sendSuccessResponse(response, 201, rental);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async getUserRentals(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
	
			const rentals = await RoomService.getUserRentals(payload.sub);
	
			sendSuccessResponse(response, 200, rentals);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async getRoomDetails(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			const roomId = request.params.roomId;
	
			if (!payload.sub) createHttpError(403, 'forbidden', 'Não autenticado');
			if (!roomId) createHttpError(403, 'forbidden', 'Sala não encotrada');
	
			const details = await RoomService.getRoomDetailsById(roomId as string);
	
			sendSuccessResponse(response, 200, details);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async toggleRoomAvailability(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			const roomId = request.params.roomId;
			const { status }: { status: boolean} = request.body;
	
			if (!payload.sub) {
				throw createHttpError(403, 'forbidden', 'Não autenticado');
			} if (!roomId) {
				throw createHttpError(403, 'forbidden', 'Sala não encontrada');
			}
	
			await RoomService.toggleRoomAvailabilityById(roomId as string, status);
	
			sendSuccessResponse(response, 200, { success: true });
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async updateRoom(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			const roomId = request.params.roomId;
			const data: UpdateRoom = request.body;
	
			if (!payload.sub) {
				throw createHttpError(403, 'forbidden', 'Não autenticado');
			} if (!roomId) {
				throw createHttpError(403, 'forbidden', 'Sala não encontrada');
			}
	
			await RoomService.updateRoomById(roomId as string, data);
	
			sendSuccessResponse(response, 200, { success: true });
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async enterpriseValues(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
			const values = await RoomService.getEnterpriseValues(payload.sub);
	
			sendSuccessResponse(response, 200, values);
		} catch (error) {
			next(error);
		}
	}



	public static async remove(request: Request, response: Response, next: NextFunction) {
		try {
			const token = getTokenFromHeader(request.headers.authorization);
			const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;

			const { roomId } = request.params;

			const data = await RoomService.remove(payload.sub, String(roomId));
	
			sendSuccessResponse(response, 200, data);
		} catch (error) {
			next(error);
		}
	}
}

