import { createHttpError } from "../../lib/http-error";
import { FLOOR_MAP, CHARACTERISTIC_MAP } from "../../consts/room/service.consts";
import { EnterpriseDashboardResponse } from "../../types/room/enterpriseDashboardResponse.type";
import { RoomInfos } from "../../types/room/roomInfos.type";
import { RoomOccupancyResponse } from "../../types/room/roomOccupancyResponse.type";
import { getDateRangeKeys } from "../../utils/getDateRangeKeys.util";
import { isValidRoomImageUrl } from "../../utils/isValidRoomImageUrl.util";
import { toWeekDays } from "../../utils/toWeekDays.util";
import { mapRoomToClient } from "./mappers/mapRoomToClient.mapper";
import { mapRoomRentalToClient } from "./mappers/roomRentalToClient.mapper";
import { EnterpriseValuesResponse } from "../../types/room/enterpriseValuesResponse.type";
import { UpdateRoom } from "../../types/room/updateRoom.type";
import { RoomRepository } from "./repository";
import { AuthPayload } from "../../types/auth/authPayload.type";
import { NewRoom } from "../../types/room/newRoom.type";
import { CreateRoomRental } from "../../types/room/createRoomRental.type";
import { roomDetailsMapper } from "./mappers/roomDetails.mapper";
import { enterpriseDashboardMapper } from "./mappers/enterpriseDashboard.mapper";
import { enterpriseValuesMapper } from "./mappers/enterpriseValues.mapper";
import { CreateRoomResponse } from "../../types/room/createRoomInput.type";
import { createRoomPayloadMapper } from "./mappers/createRoomPayload.mapper";

export class RoomService {

	public static async getEnterpriseDashboard(userId: string) {
		const user = await RoomRepository.getUserAccountTypeById(userId);
	
		if (!user) {
			throw createHttpError(404, "not_found", "Usuário não encontrado!");
		} if (user.accountType !== "ENTERPRISE") {
			throw createHttpError(403, "forbidden", "Acesso restrito ao painel da empresa.");
		}
	
		const {
			rooms,
			activeRentals,
			entriesToday,
			exitsToday,
		} = await RoomRepository.getEnterpriseDashboard();
		
		const historyRentals = await RoomRepository.roomRentalsByEndDate();
	
		const latestEntryExit = (await RoomRepository.lastEntryExit())[0];
		
		return enterpriseDashboardMapper({
			rooms,
			activeRentals,
			historyRentals,
			latestEntryExit,
			entriesToday,
			exitsToday,
		});
	}
	


	public static async createRoom(payload: AuthPayload, data: NewRoom): Promise<CreateRoomResponse> {
		
		const user = await RoomRepository.getUserAccountTypeById(payload.sub);

		if (!user || user.accountType !== "ENTERPRISE") {
			throw createHttpError(403, "forbidden", "Apenas contas enterprise podem criar salas.");
		}

		const mappedFloor = FLOOR_MAP[data.floor];
		const mappedCharacteristic = CHARACTERISTIC_MAP[data.characteristics];
		const roomName = data.roomName.trim();
	
		if (!roomName) {
			throw createHttpError(400, "bad_request", "Nome da sala invalido.");
		} if (!mappedFloor) {
			throw createHttpError(400, "bad_request", "Andar invalido.");
		} if (!mappedCharacteristic) {
			throw createHttpError(400, "bad_request", "Característica invalida.");
		} if (data.area <= 0) {
			throw createHttpError(400, "bad_request", "Área invalida.");
		} if (data.roomImage && !isValidRoomImageUrl(data.roomImage)) {
			throw createHttpError(400, "bad_request", "Imagem da sala invalida.");
		}
	
		const existingRoom = await RoomRepository.findRoomByName(data.enterpriseOwnerId, roomName);
	
		if (existingRoom) {
			throw createHttpError(409, "conflict", "Já existe uma sala com esse nome.");
		}

		const roomData = createRoomPayloadMapper(
			roomName,
			data,
			mappedCharacteristic,
			mappedFloor
		);
			
		const room = await RoomRepository.createRoom(roomData);
	
		return mapRoomToClient(room);
	}
	

	
	public static async getRoomOccupancy(roomId: string): Promise<RoomOccupancyResponse> {

		const room = await RoomRepository.findRoomById(roomId);
	
		if (!room) {
			throw createHttpError(404, "not_found", "Sala não encontrada!");
		}
	
		const activeRentals = await RoomRepository.getRoomActiveRentals(roomId);
	
		const occupiedHours: { 
			startHour: string; 
			endHour: string 
		}[] = [];
	
		const occupiedDays = Array.from(
			new Set(activeRentals.flatMap((rental) => getDateRangeKeys(rental.startDate, rental.endDate)))
		);
	
		return {
			occupiedHours,
			occupiedDays,
		};
	}
	
	
	
	public static async getRoomsList() {
		const rooms = await RoomRepository.getRoomsList();
	
		return rooms.map((room) => mapRoomToClient(room));
	}
	

	
	public static async createRoomRental(data: CreateRoomRental) {
		const selectedWeekDays = toWeekDays(data.selectedWeekDays);
		const startDate = new Date(data.startDate);
		const endDate = new Date(data.endDate);
	
		const overlappingRental = await RoomRepository.overlappingRental(data.roomId, startDate, endDate);
	
		if (overlappingRental) {
			throw createHttpError(409, "conflict", "A sala já está ocupada nesse período.");
		}
	
		const room = await RoomRepository.getRoomAvailabilityById(data.roomId);
	
		if (!room) {
			throw createHttpError(404, "not_found", "Sala não encontrada.");
		} if (!room.isAvailable) {
			throw createHttpError(400, "bad_request", "A sala não está disponível.");
		}
	
		const rental = await RoomRepository.createRoomRental({
			...data,
			selectedWeekDays,
			endDate,
			startDate,
		});
	
		return mapRoomRentalToClient(rental);
	}
	
	
	
	public static async getRoomDetailsById(roomId : string): Promise<RoomInfos> {
		const room = await RoomRepository.getRoomDetailsById(roomId);
	
		if (!room) throw new Error("Não foi possível achar a sala");
	
		return roomDetailsMapper(room);
	}
	
	
	
	public static async updateRoomById(
		roomId: string,
		data: UpdateRoom,
	): Promise<void> {
		await RoomRepository.updateRoomById(roomId, data);
	}
	
	
	
	public static async toggleRoomAvailabilityById(
		roomId: string,
		status: boolean,
	) {
		return await RoomRepository.toggleRoomAvailabilityById(roomId, status);
	}
	
	
	
	public static async getUserRentals(professionalId: string) {
		const rentals = await RoomRepository.getUserRentals(professionalId);
	
		return rentals.map((rental) => mapRoomRentalToClient(rental));
	}
	
	
	
	public static async getEnterpriseValues(userId: string): Promise<EnterpriseValuesResponse> {
		const user = await RoomRepository.getUserAccountTypeById(userId);
	
		if (!user) {
			throw createHttpError(404, "not_found", "Usuário não encontrado!");
		} if (user.accountType !== "ENTERPRISE") {
			throw createHttpError(403, "forbidden", "Acesso restrito ao painel da empresa.");
		}
	
		const {
			expensesSummary,
			monthlyRentals,
			rooms,
		} = await RoomRepository.getEnterpriseValues();
	
		return enterpriseValuesMapper(
			expensesSummary,
			monthlyRentals,
			rooms,
		)
	}
}

