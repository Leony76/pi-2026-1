import prisma from "../../lib/prisma";
import { WeekDay } from "@prisma/client";
import { createHttpError } from "../../lib/http-error";

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

type EnterpriseDashboardRoomOccupation = {
	id: string;
	isAvailable: boolean;
	occupant: string | null;
	title: string;
	occupation: {
		startTime: string | null;
		endTime: string | null;
	};
};

type EnterpriseDashboardCustomer = {
	id: string;
	name: string;
	specialty: string;
	occupiedRoom: string | null;
	occupation: {
		startHour: string | null;
		endHour: string | null;
		limitDate: string | null;
	};
};

type EnterpriseDashboardCustomerHistory = {
	id: string;
	name: string;
	specialty: string;
	occupiedRoom: string | null;
	unoccupiedRoomAt: string;
};

type EnterpriseDashboardEntryExitToday = {
	occupantName: string;
	room: string;
	entry: string;
	exit: string;
	sessions: number;
	totalValue: "DAILY" | "WEEKLY" | "MONTHLY";
} | null;

export type EnterpriseDashboardResponse = {
	stats: {
		totalRooms: number;
		availableRooms: number;
		occupiedRooms: number;
		entriesToday: number;
		exitsToday: number;
	};
	roomOccupation: EnterpriseDashboardRoomOccupation[];
	activeCustomers: EnterpriseDashboardCustomer[];
	historyCustomers: EnterpriseDashboardCustomerHistory[];
	entryExitToday: EnterpriseDashboardEntryExitToday;
};

export type RoomOccupancyResponse = {
	occupiedHours: { startHour: string; endHour: string }[];
	occupiedDays: WeekDay[];
};

function startOfDay(date: Date): Date {
	const day = new Date(date);
	day.setHours(0, 0, 0, 0);
	return day;
}

function nextDay(date: Date): Date {
	return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}

export async function getEnterpriseDashboard(userId: string): Promise<EnterpriseDashboardResponse> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			accountType: true,
		},
	});

	if (!user) {
		throw createHttpError(404, "not_found", "Usuário não encontrado!");
	}

	if (user.accountType !== "ENTERPRISE") {
		throw createHttpError(403, "forbidden", "Acesso restrito ao painel da empresa.");
	}

	const now = new Date();
	const dayStart = startOfDay(now);
	const dayEnd = nextDay(dayStart);

	const [rooms, activeRentals, entriesToday, exitsToday] = await Promise.all([
		prisma.room.findMany({
			select: {
				id: true,
				title: true,
				isAvailable: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		}),
		prisma.roomRental.findMany({
			where: {
				startDate: {
					lte: now,
				},
				endDate: {
					gte: now,
				},
			},
			select: {
				roomId: true,
				startDate: true,
				endDate: true,
				professional: {
					select: {
						name: true,
					},
				},
				room: {
					select: {
						title: true,
					},
				},
			},
		}),
		prisma.roomRental.findMany({
			where: {
				endDate: {
					lt: now,
				},
			},
			select: {
				id: true,
				startDate: true,
				endDate: true,
				professional: {
					select: {
						name: true,
						specialty: true,
					},
				},
				room: {
					select: {
						title: true,
					},
				},
			},
			orderBy: {
				endDate: "desc",
			},
		}),
		prisma.entryExit.count({
			where: {
				enteredAt: {
					gte: dayStart,
					lt: dayEnd,
				},
			},
		}),
		prisma.entryExit.count({
			where: {
				exitedAt: {
					gte: dayStart,
					lt: dayEnd,
				},
			},
		}),
		prisma.entryExit.findMany({
			where: {
				enteredAt: {
					gte: dayStart,
					lt: dayEnd,
				},
			},
			select: {
				enteredAt: true,
				exitedAt: true,
				sessionsCount: true,
				billingType: true,
				professional: {
					select: {
						name: true,
					},
				},
				room: {
					select: {
						title: true,
					},
				},
			},
			orderBy: {
				enteredAt: "desc",
			},
			take: 1,
		}),
	]);

	const activeRentalByRoomId = new Map(activeRentals.map((rental) => [rental.roomId, rental]));

	const roomOccupation = rooms.map((room) => {
		const activeRental = activeRentalByRoomId.get(room.id);

		return {
			id: room.id,
			isAvailable: activeRental ? false : room.isAvailable,
			occupant: activeRental ? activeRental.professional.name : null,
			title: room.title,
			occupation: {
				startTime: activeRental ? activeRental.startDate.toISOString() : null,
				endTime: activeRental ? activeRental.endDate.toISOString() : null,
			},
		};
	});

	const activeCustomers = activeRentals.map((rental) => ({
		id: rental.roomId,
		name: rental.professional.name,
		specialty: rental.professional.specialty,
		occupiedRoom: rental.room.title,
		occupation: {
			startHour: rental.startDate.toISOString(),
			endHour: rental.endDate.toISOString(),
			limitDate: rental.endDate.toISOString(),
		},
	}));

	const historyCustomers = (await prisma.roomRental.findMany({
		where: {
			endDate: {
				lt: now,
			},
		},
		select: {
			id: true,
			endDate: true,
			professional: {
				select: {
					name: true,
					specialty: true,
				},
			},
			room: {
				select: {
					title: true,
				},
			},
		},
		orderBy: {
			endDate: "desc",
		},
	})).map((rental) => ({
		id: rental.id,
		name: rental.professional.name,
		specialty: rental.professional.specialty,
		occupiedRoom: rental.room.title,
		unoccupiedRoomAt: rental.endDate.toISOString(),
	}));

	const latestEntryExit = (await prisma.entryExit.findMany({
		where: {
			room: {
				enterpriseOwnerId: userId,
			},
			enteredAt: {
				gte: dayStart,
				lt: dayEnd,
			},
		},
		select: {
			enteredAt: true,
			exitedAt: true,
			sessionsCount: true,
			billingType: true,
			professional: {
				select: {
					name: true,
				},
			},
			room: {
				select: {
					title: true,
				},
			},
		},
		orderBy: {
			enteredAt: "desc",
		},
		take: 1,
	}))[0];

	const availableRooms = roomOccupation.filter((room) => room.isAvailable).length;

	return {
		stats: {
			totalRooms: rooms.length,
			availableRooms,
			occupiedRooms: rooms.length - availableRooms,
			entriesToday,
			exitsToday,
		},
		roomOccupation,
		activeCustomers,
		historyCustomers,
		entryExitToday: latestEntryExit
			? {
				occupantName: latestEntryExit.professional.name,
				room: latestEntryExit.room.title,
				entry: latestEntryExit.enteredAt.toISOString(),
				exit: latestEntryExit.exitedAt?.toISOString() ?? latestEntryExit.enteredAt.toISOString(),
				sessions: latestEntryExit.sessionsCount,
				totalValue: latestEntryExit.billingType,
			}
			: null,
	};
}

export async function getRoomOccupancy(roomId: string): Promise<RoomOccupancyResponse> {
	const room = await prisma.room.findUnique({
		where: { id: roomId },
		select: {
			id: true,
		},
	});

	if (!room) {
		throw createHttpError(404, "not_found", "Sala não encontrada!");
	}

	const now = new Date();
	const activeRentals = await prisma.roomRental.findMany({
		where: {
			roomId,
			endDate: {
				gte: now,
			},
		},
		select: {
			selectedHours: true,
			selectedWeekDay: true,
		},
	});

	const occupiedHours = activeRentals.flatMap((rental) => {
		if (!isSelectedHours(rental.selectedHours)) {
			return [] as { startHour: string; endHour: string }[];
		}

		return [rental.selectedHours];
	});

	const occupiedDays = Array.from(
		new Set(activeRentals.flatMap((rental) => rental.selectedWeekDay))
	);

	return {
		occupiedHours,
		occupiedDays,
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
