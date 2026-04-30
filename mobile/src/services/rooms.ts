import { apiGet, apiPost } from "./api";
import { apiGetWithAuth, apiPostWithAuth } from "./auth-api";
import { RoomDisplayCard } from "@/types/room.type";
import { Expanses } from "@/types/expenses.type";
import { RoomPrice } from "@/types/roomPrice.type";
import { OverallRoomRevenue } from "@/types/roomRevenue.type";
import { Days } from "@/types/days.type";
import { HourShift } from "@/types/hourShift.type";
import { Specialty } from "@/constants/maps/selectOptions.map";

type AuthHandlers = {
	token: string;
	refreshToken: string;
	updateTokens: (token: string, refreshToken: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export type CreateRoomInput = {
	roomName: string;
	roomImage?: string | null;
	floor: string;
	area: number;
	characteristics: string;
	pricePerHour: number;
	price_3xWeek: number;
	pricePerMonth: number;
	items: {
		name: string;
		quantity: number;
	}[];
};

export type EnterpriseRoomOccupation = {
	id: string;
	isAvailable: boolean;
	occupant: string | null;
	title: string;
	occupation: {
		startTime: string | null;
		endTime: string | null;
	};
};

export type EnterpriseDashboardResponse = {
	stats: {
		totalRooms: number;
		availableRooms: number;
		occupiedRooms: number;
		entriesToday: number;
		exitsToday: number;
	};
	roomOccupation: EnterpriseRoomOccupation[];
	activeCustomers: {
		id: string;
		name: string;
		specialty: Specialty;
		occupiedRoom: string | null;
		occupation: {
			startHour: string | null;
			endHour: string | null;
			limitDate: string | null;
		};
	}[];
	historyCustomers: {
		id: string;
		name: string;
		specialty: Specialty;
		occupiedRoom: string | null;
		unoccupiedRoomAt: string;
	}[];
	entryExitToday: {
		occupantName: string;
		room: string;
		entry: string;
		exit: string;
		sessions: number;
		totalValue: 'DAILY' | 'WEEKLY' | 'MONTHLY';
	} | null;
};

export type RoomOccupancyResponse = {
	occupiedHours: HourShift[];
	occupiedDays: Days[];
};

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

export type EnterpriseValuesResponse = {
	summary: {
		revenueThisMonth: number;
		expensesThisMonth: number;
		netIncome: number;
	};
	roomRevenue: OverallRoomRevenue;
	expenses: Expanses;
	roomPrices: RoomPrice[];
};

export async function fetchRooms(): Promise<RoomDisplayCard[]> {
	return apiGet<RoomDisplayCard[]>("/rooms");
}

export function fetchRoomOccupancy(roomId: string, token: string): Promise<RoomOccupancyResponse> {
	return apiGet<RoomOccupancyResponse>(`/rooms/${roomId}/occupancy`, token);
}

export async function fetchEnterpriseDashboardWithAuth(auth: AuthHandlers): Promise<EnterpriseDashboardResponse> {
	return apiGetWithAuth<EnterpriseDashboardResponse>(
		"/rooms/dashboard",
		auth.token,
		auth.refreshToken,
		auth.updateTokens,
		auth.signOut
	);
}

export async function fetchEnterpriseValuesWithAuth(auth: AuthHandlers): Promise<EnterpriseValuesResponse> {
	return apiGetWithAuth<EnterpriseValuesResponse>(
		"/rooms/values",
		auth.token,
		auth.refreshToken,
		auth.updateTokens,
		auth.signOut
	);
}

export async function createRoomWithAuth(data: CreateRoomInput, auth: AuthHandlers): Promise<RoomDisplayCard> {
	return apiPostWithAuth<RoomDisplayCard>(
		"/rooms",
		{
			roomName: data.roomName,
			roomImage: data.roomImage ?? null,
			floor: data.floor,
			area: data.area,
			characteristics: data.characteristics,
			pricePerHour: data.pricePerHour,
			price_3xWeek: data.price_3xWeek,
			pricePerMonth: data.pricePerMonth,
			items: data.items,
		},
		auth.token,
		auth.refreshToken,
		auth.updateTokens,
		auth.signOut
	);
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
