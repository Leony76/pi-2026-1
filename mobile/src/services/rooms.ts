import { apiGet, apiPost } from "./api";
import { apiGetWithAuth, apiPostWithAuth } from "./auth-api";
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

	type AuthHandlers = {
		token: string;
		refreshToken: string;
		updateTokens: (token: string, refreshToken: string) => Promise<void>;
		signOut: () => Promise<void>;
	};

	export async function createRoomRentalWithAuth(
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
		auth: AuthHandlers
	): Promise<RoomRental> {
		return apiPostWithAuth<RoomRental>(
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
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}

export async function fetchUserRentals(token: string): Promise<RoomRental[]> {
	return apiGet<RoomRental[]>("/rooms/rentals/me", token);
}

	export async function fetchUserRentalsWithAuth(auth: AuthHandlers): Promise<RoomRental[]> {
		return apiGetWithAuth<RoomRental[]>(
			"/rooms/rentals/me",
			auth.token,
			auth.refreshToken,
			auth.updateTokens,
			auth.signOut
		);
	}
