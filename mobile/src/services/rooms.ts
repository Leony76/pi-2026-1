import { apiGet, apiPost } from "./api";
import { RoomDisplayCard } from "@/types/room.type";

export type RoomRental = {
	id: string;
	roomTitle: string;
	roomFloor: string;
	roomCharacteristic: string;
	allocationType: "PER_HOUR" | "3X_WEEK" | "MONTH";
	startDate: string;
	endDate: string;
	totalPrice: number;
	selectedHours?: { startHour: string; endHour: string } | null;
	selectedWeekDays: string[];
	isActive: boolean;
};

export async function fetchRooms(): Promise<RoomDisplayCard[]> {
	return apiGet<RoomDisplayCard[]>("/rooms");
}

export async function createRoomRental(
	data: {
		roomId: string;
		allocationType: "PER_HOUR" | "3X_WEEK" | "MONTH";
		paymentMethod?: "PIX" | "BANK_SLIP" | "CREDIT_CARD";
		startDate: Date;
		endDate: Date;
		totalPrice: number;
		selectedHours?: { startHour: string; endHour: string };
		selectedWeekDays?: string[];
	},
	token: string
): Promise<RoomRental> {
	return apiPost<RoomRental>(
		"/rooms/rentals",
		{
			roomId: data.roomId,
			allocationType: data.allocationType,
			paymentMethod: data.paymentMethod,
			startDate: data.startDate.toISOString(),
			endDate: data.endDate.toISOString(),
			totalPrice: data.totalPrice,
			selectedHours: data.selectedHours,
			selectedWeekDays: data.selectedWeekDays,
		},
		token
	);
}

export async function fetchUserRentals(token: string): Promise<RoomRental[]> {
	return apiGet<RoomRental[]>("/rooms/rentals/me", token);
}
