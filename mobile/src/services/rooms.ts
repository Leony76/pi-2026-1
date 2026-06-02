import { ApiService } from "./api";
import { RoomDisplayCard } from "@/types/room/room.type";
import { RoomInfos } from "@/types/room/RoomInfos.type";
import { AuthHandlers } from "@/types/auth/authHandlers.type";
import { CreateRoomInput } from "@/types/room/createRoom.type";
import { UpdateRoom } from "@/types/room/updateRoom.type";
import { RoomOccupancyResponse } from "@/types/room/roomOccupancyResponse.type";
import { RoomRental } from "@/types/room/roomRental.type";
import { CreateRoomRental } from "@/types/room/createRoomRental.type";
import { RoomRemovalResponse } from "@/types/room/roomRemovalResponse.type";

export class RoomService {

	public static async fetchRooms(
		auth : AuthHandlers
	): Promise<RoomDisplayCard[]> {
		return ApiService.getWithAuth<RoomDisplayCard[]>(
			"/rooms",
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}



	public static async remove(
		auth : AuthHandlers,
		id   : string
	): Promise<RoomRemovalResponse> {
		return ApiService.patchWithAuth<RoomRemovalResponse>(
			`/rooms/${id}/remove`,
			{ id },
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		)
	}
	


	public static async fetchRoomOccupancy(
		roomId : string, 
		auth   : AuthHandlers,
	): Promise<RoomOccupancyResponse> {
		return ApiService.getWithAuth<RoomOccupancyResponse>(
			`/rooms/${roomId}/occupancy`, 
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}
	


	public static async createRoom(
		data : CreateRoomInput, 
		auth : AuthHandlers
	): Promise<RoomDisplayCard> {
		return ApiService.postWithAuth<RoomDisplayCard>(
			"/rooms",
			{
				roomName: data.roomName,
				roomImage: data.roomImage ?? null,
				floor: data.floor,
				area: data.area,
				characteristics: data.characteristics,
				pricePerHour: data.pricePerHour,
				priceWeek: data.priceWeek,
				pricePerMonth: data.pricePerMonth,
				items: data.items,
				customItems: data.customItems,
			},
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}
	


	public static async updateRoom(
		data : UpdateRoom, 
		auth : AuthHandlers
	): Promise<UpdateRoom> {
		return ApiService.patchWithAuth<UpdateRoom>(
			`/rooms/${data.id}/update`,
			{
				roomName: data.roomName,
				roomImage: data.roomImage ?? null,
				floor: data.floor,
				area: data.area,
				characteristics: data.characteristics,
				pricePerHour: data.pricePerHour,
				priceWeek: data.priceWeek,
				pricePerMonth: data.pricePerMonth,
				items: data.items,
				customItems: data.customItems,
			},
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}
	
	

	public static async toggleRoomAvailability(
		roomId : string, 
		status : boolean,
		auth   : AuthHandlers,
	): Promise<{ success: boolean }> {
		return ApiService.patchWithAuth<{ success: boolean }>(
			`/rooms/${roomId}/switchAvailability`,
			{ status: status },
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}
	
	

	public static async createRoomRental(
		data : CreateRoomRental,
		auth : AuthHandlers
	): Promise<RoomRental> {
		return ApiService.postWithAuth<RoomRental>(
			"/rooms/rentals",
			{
				roomId: data.roomId,
				allocationType: data.allocationType,
				paymentMethod: data.paymentMethod,
				startDate: data.startDate.toISOString(),
				endDate: data.endDate.toISOString(),
				totalPrice: data.totalPrice,
				selectedWeekDays: data.selectedWeekDays,
			},
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}
	


	public static async fetchRoomDetails(
		roomId : string,
		auth   : AuthHandlers,
	): Promise<RoomInfos> {
		return ApiService.getWithAuth<RoomInfos>(
			`/rooms/${roomId}/details`,
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}
	
	

	public static async fetchUserRentals(
		auth : AuthHandlers,
	): Promise<RoomRental[]> {
		return ApiService.getWithAuth<RoomRental[]>(
			"/rooms/rentals/me", 
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}
}

