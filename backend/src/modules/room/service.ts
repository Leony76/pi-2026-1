import prisma from "../../lib/prisma";
import { WeekDay } from "@prisma/client";

const FLOOR_TRANSLATIONS: Record<string, string> = {
	GROUND_FLOOR: "Térreo",
	FIRST_FLOOR: "1º Andar",
	SECOND_FLOOR: "2º Andar",
	THIRD_FLOOR: "3º Andar",
	FOURTH_FLOOR: "4º Andar",
	FIFTH_FLOOR: "5º Andar",
};

const CHARACTERISTIC_TRANSLATIONS: Record<string, string> = {
	AIR_CONDITIONER: "Climatizado",
	SOUNDPROOFED: "Isonorizado",
	AIR_CONDITIONER_PLUS_SOUNDPROOFED: "Climatizado e Isonorizado",
	DEFAULT: "Padrão",
};

function translateFloor(floor: string): string {
	return FLOOR_TRANSLATIONS[floor] || floor;
}

function translateCharacteristic(characteristic: string): string {
	return CHARACTERISTIC_TRANSLATIONS[characteristic] || characteristic;
}

function toPrismaAllocationType(allocationType: "PER_HOUR" | "3X_WEEK" | "MONTH") {
	if (allocationType === "3X_WEEK") {
		return "THREE_X_WEEK";
	}

	return allocationType;
}

function toClientAllocationType(allocationType: string) {
	if (allocationType === "THREE_X_WEEK") {
		return "3X_WEEK";
	}

	return allocationType;
}

function toWeekDays(days?: string[]): WeekDay[] {
	if (!days) {
		return [];
	}

	const validDays = Object.values(WeekDay);
	return days.filter((day): day is WeekDay => validDays.includes(day as WeekDay));
}

function isSelectedHours(value: unknown): value is { startHour: string; endHour: string } {
	return typeof value === "object"
		&& value !== null
		&& "startHour" in value
		&& "endHour" in value
		&& typeof (value as { startHour?: unknown }).startHour === "string"
		&& typeof (value as { endHour?: unknown }).endHour === "string";
}

function mapRoomRentalToClient(rental: {
	id: string;
	room: {
		title: string;
		floor: string;
		characteristic: string;
	};
	allocationType: string;
	startDate: Date;
	endDate: Date;
	totalPrice: { toString(): string };
	selectedHours?: unknown;
	selectedWeekDay: WeekDay[];
}) {
	return {
		id: rental.id,
		roomTitle: rental.room.title,
		roomFloor: translateFloor(rental.room.floor),
		roomCharacteristic: translateCharacteristic(rental.room.characteristic),
		allocationType: toClientAllocationType(rental.allocationType),
		startDate: rental.startDate,
		endDate: rental.endDate,
		totalPrice: parseFloat(rental.totalPrice.toString()),
		selectedHours: isSelectedHours(rental.selectedHours) ? rental.selectedHours : null,
		selectedWeekDays: rental.selectedWeekDay,
		isActive: new Date() >= rental.startDate && new Date() <= rental.endDate,
	};
}

export async function getRoomsList() {
	const rooms = await prisma.room.findMany({
		select: {
			id: true,
			title: true,
			displayImage: true,
			floor: true,
			area: true,
			characteristic: true,
			isAvailable: true,
			prices: {
				select: {
					pricePerHour: true,
					price3xWeek: true,
					pricePerMonth: true,
				},
			},
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	return rooms.map((room) => ({
		id: room.id,
		displayImage: room.displayImage,
		isAvailable: room.isAvailable,
		title: room.title,
		complementaryData: {
			area: parseFloat(room.area.toString()),
			additional: translateCharacteristic(room.characteristic),
			floor: translateFloor(room.floor),
		},
		prices: room.prices
			? {
					perHour: parseFloat(room.prices.pricePerHour.toString()),
					_3xWeek: parseFloat(room.prices.price3xWeek.toString()),
					month: parseFloat(room.prices.pricePerMonth.toString()),
			  }
			: {
					perHour: 0,
					_3xWeek: 0,
					month: 0,
			  },
	}));
}

export async function createRoomRental(data: {
	professionalId: string;
	roomId: string;
	allocationType: "PER_HOUR" | "3X_WEEK" | "MONTH";
	paymentMethod?: "PIX" | "BANK_SLIP" | "CREDIT_CARD";
	startDate: Date;
	endDate: Date;
	totalPrice: number;
	selectedHours?: { startHour: string; endHour: string };
	selectedWeekDays?: string[];
}) {
	const selectedWeekDays = toWeekDays(data.selectedWeekDays);
	const selectedHoursData = data.selectedHours ? { selectedHours: data.selectedHours } : {};

	const rental = await prisma.roomRental.create({
		data: {
			professionalId: data.professionalId,
			roomId: data.roomId,
			allocationType: toPrismaAllocationType(data.allocationType),
			paymentMethod: data.paymentMethod ?? null,
			startDate: new Date(data.startDate),
			endDate: new Date(data.endDate),
			totalPrice: data.totalPrice.toString(),
			selectedWeekDay: selectedWeekDays,
			...selectedHoursData,
		},
		include: {
			room: {
				select: {
					title: true,
					floor: true,
					area: true,
					characteristic: true,
				},
			},
		},
	});

	return mapRoomRentalToClient(rental);
}

export async function getUserRentals(professionalId: string) {
	const rentals = await prisma.roomRental.findMany({
		where: {
			professionalId,
		},
		include: {
			room: {
				select: {
					id: true,
					title: true,
					floor: true,
					area: true,
					characteristic: true,
					prices: {
						select: {
							pricePerHour: true,
							price3xWeek: true,
							pricePerMonth: true,
						},
					},
				},
			},
		},
		orderBy: {
			startDate: "desc",
		},
	});

	return rentals.map((rental) => mapRoomRentalToClient(rental));
}
