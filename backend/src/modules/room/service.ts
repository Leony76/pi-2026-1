import prisma from "../../lib/prisma";
import { WeekDay } from "@prisma/client";
import { createHttpError } from "../../lib/http-error";
import { formatLocalDate } from "../../utils/formatLocalDate";

const FLOOR_MAP: Record<string, string> = {
	groundFloor: "GROUND_FLOOR",
	firstFloor: "FIRST_FLOOR",
	secondFloor: "SECOND_FLOOR",
	thirdFloor: "THIRD_FLOOR",
	fourthFloor: "FOURTH_FLOOR",
	fifthFloor: "FIFTH_FLOOR",
};

const CHARACTERISTIC_MAP: Record<string, string> = {
	airConditioner: "AIR_CONDITIONER",
	soundproofed: "SOUNDPROOFED",
	airConditionerPlusSoundproofed: "AIR_CONDITIONER_PLUS_SOUNDPROOFED",
	default: "DEFAULT",
};

const ROOM_ITEM_MAP: Record<string, string> = {
	"Sofa / Divã": "SOFA_DIVA",
	Cadeira: "CADEIRA",
	Computador: "COMPUTADOR",
	Maca: "MACA",
	"Armário": "ARMARIO",
	Banheiro: "BANHEIRO",
	"Ar-condi.": "AR_CONDI",
	"TV / Monitor.": "TV_MONITOR",
	"Equip. médico": "EQUIP_MEDICO",
	Espelho: "ESPELHO",
	Plantas: "PLANTAS",
	"Ilumi. especial": "ILUMI_ESPECIAL",
};

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

function toPrismaAllocationType(allocationType: "DAILY" | "WEEK" | "MONTH") {
	if (allocationType === "DAILY") {
		return "DAILY";
	}

	if (allocationType === "WEEK") {
		return "WEEK";
	}

	return "MONTH";
}

function toClientAllocationType(allocationType: string) {
	if (allocationType === "WEEK") {
		return "WEEK";
	}

	return allocationType as "DAILY" | "WEEK" | "MONTH" | string;
}

function toWeekDays(days?: string[]): WeekDay[] {
	if (!days) {
		return [];
	}

	const validDays = Object.values(WeekDay);
	return days.filter((day): day is WeekDay => validDays.includes(day as WeekDay));
}

function getDateRangeKeys(startDate: Date, endDate: Date): string[] {
	const keys: string[] = [];
	const currentDate = new Date(startDate);
	currentDate.setUTCHours(0, 0, 0, 0);

	const finalDate = new Date(endDate);
	finalDate.setUTCHours(0, 0, 0, 0);

	if (finalDate > currentDate) {
		finalDate.setUTCDate(finalDate.getUTCDate() - 1);
	}

	while (currentDate <= finalDate) {
		keys.push(formatLocalDate(currentDate));
		currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	}

	return keys;
}

function overlapsDateRange(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
	return startA < endB && startB < endA;
}

function isValidRoomImageUrl(value: string): boolean {
	return value.startsWith("data:image/") || /^https?:\/\//.test(value);
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
	selectedWeekDay: WeekDay[];
}) {
	const selectedWeekDays = getDateRangeKeys(rental.startDate, rental.endDate);

	return {
		id: rental.id,
		roomTitle: rental.room.title,
		roomFloor: translateFloor(rental.room.floor),
		roomCharacteristic: translateCharacteristic(rental.room.characteristic),
		allocationType: toClientAllocationType(rental.allocationType),
		startDate: rental.startDate,
		endDate: rental.endDate,
		totalPrice: parseFloat(rental.totalPrice.toString()),
		selectedWeekDays,
		isActive: new Date() >= rental.startDate && new Date() <= rental.endDate,
	};
}

function mapRoomToClient(room: {
	id: string;
	displayImage: string | null;
	isAvailable: boolean;
	title: string;
	floor: string;
	area: { toString(): string };
	characteristic: string;
	prices: {
		pricePerHour: { toString(): string };
		priceWeek: { toString(): string };
		pricePerMonth: { toString(): string };
	} | null;
}) {
	return {
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
				_week: parseFloat(room.prices.priceWeek.toString()),
				month: parseFloat(room.prices.pricePerMonth.toString()),
			}
			: {
				perHour: 0,
				_week: 0,
				month: 0,
			},
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
	occupiedDays: string[];
};

export type EnterpriseValuesRoomRevenue = {
	id: string;
	room: string;
	totalRevenue: number;
	revenue: {
		byHour: number;
		_week: number;
		byMonth: number;
	};
};

export type EnterpriseValuesRoomPrice = {
	id: string;
	room: string;
	price: {
		byHour: number;
		_week: number;
		byMonth: number;
	};
};

export type EnterpriseValuesResponse = {
	summary: {
		revenueThisMonth: number;
		expensesThisMonth: number;
		netIncome: number;
	};
	roomRevenue: {
		totalRevenue: number;
		roomsRevenue: EnterpriseValuesRoomRevenue[];
	};
	expenses: {
		maintenance: number;
		eletricalEnergy: number;
		cleaning: number;
		totalValue: number;
	};
	roomPrices: EnterpriseValuesRoomPrice[];
};

function startOfMonth(date: Date): Date {
	const monthStart = new Date(date);
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);
	return monthStart;
}

function nextMonth(date: Date): Date {
	const next = new Date(date);
	next.setMonth(next.getMonth() + 1);
	return next;
}

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

	const [rooms, activeRentals, _historyRentals, entriesToday, exitsToday, _latestEntryExit] = await Promise.all([
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
						specialty: true,
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
			selectedWeekDay: true,
			startDate: true,
			endDate: true,
		},
	});

	const occupiedHours: { startHour: string; endHour: string }[] = [];

	const occupiedDays = Array.from(
		new Set(activeRentals.flatMap((rental) => getDateRangeKeys(rental.startDate, rental.endDate)))
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
					priceWeek: true,
					pricePerMonth: true,
				},
			},
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	return rooms.map((room) => mapRoomToClient(room));
}

export async function createRoom(data: {
	enterpriseOwnerId: string;
	roomName: string;
	roomImage?: string | null;
	floor: string;
	area: number;
	characteristics: string;
	pricePerHour: number;
		priceWeek: number;
	pricePerMonth: number;
	items: { name: string; quantity: number }[];
}) {
	const mappedFloor = FLOOR_MAP[data.floor];
	const mappedCharacteristic = CHARACTERISTIC_MAP[data.characteristics];
	const roomName = data.roomName.trim();

	if (!roomName) {
		throw createHttpError(400, "bad_request", "Nome da sala invalido.");
	}

	if (!mappedFloor) {
		throw createHttpError(400, "bad_request", "Andar invalido.");
	}

	if (!mappedCharacteristic) {
		throw createHttpError(400, "bad_request", "Característica invalida.");
	}

	if (data.area <= 0) {
		throw createHttpError(400, "bad_request", "Área invalida.");
	}

	if (data.roomImage && !isValidRoomImageUrl(data.roomImage)) {
		throw createHttpError(400, "bad_request", "Imagem da sala invalida.");
	}

	const existingRoom = await prisma.room.findFirst({
		where: {
			enterpriseOwnerId: data.enterpriseOwnerId,
			title: roomName,
		},
	});

	if (existingRoom) {
		throw createHttpError(409, "conflict", "Já existe uma sala com esse nome.");
	}

	const room = await prisma.room.create({
		data: {
			enterpriseOwnerId: data.enterpriseOwnerId,
			title: roomName,
			displayImage: data.roomImage ?? null,
			floor: mappedFloor as "GROUND_FLOOR" | "FIRST_FLOOR" | "SECOND_FLOOR" | "THIRD_FLOOR" | "FOURTH_FLOOR" | "FIFTH_FLOOR",
			area: data.area,
			characteristic: mappedCharacteristic as "AIR_CONDITIONER" | "SOUNDPROOFED" | "AIR_CONDITIONER_PLUS_SOUNDPROOFED" | "DEFAULT",
			prices: {
				create: {
					pricePerHour: data.pricePerHour,
					priceWeek: data.priceWeek,
					pricePerMonth: data.pricePerMonth,
				},
			},
			items: {
				create: data.items
					.filter((item) => Boolean(ROOM_ITEM_MAP[item.name]))
					.map((item) => ({
						name: ROOM_ITEM_MAP[item.name] as "SOFA_DIVA" | "CADEIRA" | "COMPUTADOR" | "MACA" | "ARMARIO" | "BANHEIRO" | "AR_CONDI" | "TV_MONITOR" | "EQUIP_MEDICO" | "ESPELHO" | "PLANTAS" | "ILUMI_ESPECIAL",
						quantity: item.quantity,
					})),
			},
		},
		select: {
			id: true,
			displayImage: true,
			isAvailable: true,
			title: true,
			floor: true,
			area: true,
			characteristic: true,
			prices: {
				select: {
					pricePerHour: true,
					priceWeek: true,
					pricePerMonth: true,
				},
			},
		},
	});

	return mapRoomToClient(room);
}

export async function createRoomRental(data: {
	professionalId: string;
	roomId: string;
	allocationType: "DAILY" | "WEEK" | "MONTH";
	paymentMethod?: "PIX" | "BANK_SLIP" | "CREDIT_CARD";
	startDate: Date;
	endDate: Date;
	totalPrice: number;
	selectedWeekDays?: string[];
}) {
	const selectedWeekDays = toWeekDays(data.selectedWeekDays);
	const startDate = new Date(data.startDate);
	const endDate = new Date(data.endDate);

	const overlappingRental = await prisma.roomRental.findFirst({
		where: {
			roomId: data.roomId,
			startDate: {
				lt: endDate,
			},
			endDate: {
				gt: startDate,
			},
		},
		select: {
			id: true,
		},
	});

	if (overlappingRental) {
		throw createHttpError(409, "conflict", "A sala já está ocupada nesse período.");
	}

	const room = await prisma.room.findUnique({
		where: {
			id: data.roomId,
		},
		select: {
			isAvailable: true,
		},
	});

	if (!room) {
		throw createHttpError(404, "not_found", "Sala não encontrada.");
	}

	if (!room.isAvailable) {
		throw createHttpError(400, "bad_request", "A sala não está disponível.");
	}

	const rental = await prisma.roomRental.create({
		data: {
			professionalId: data.professionalId,
			roomId: data.roomId,
			allocationType: toPrismaAllocationType(data.allocationType),
			paymentMethod: data.paymentMethod ?? null,
			startDate,
			endDate,
			totalPrice: data.totalPrice.toString(),
			selectedWeekDay: selectedWeekDays,
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
							priceWeek: true,
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

export async function getEnterpriseValues(userId: string): Promise<EnterpriseValuesResponse> {
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
	const monthStart = startOfMonth(now);
	const nextMonthStart = nextMonth(monthStart);

	const [rooms, monthlyRentals, expensesSummary] = await Promise.all([
		prisma.room.findMany({
			select: {
				id: true,
				title: true,
				prices: {
					select: {
						pricePerHour: true,
						priceWeek: true,
						pricePerMonth: true,
					},
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		}),
		prisma.roomRental.findMany({
			where: {
				startDate: {
					gte: monthStart,
					lt: nextMonthStart,
				},
			},
			select: {
				roomId: true,
				allocationType: true,
				totalPrice: true,
				room: {
					select: {
						title: true,
					},
				},
			},
		}),
		prisma.expense.aggregate({
			where: {
				date: {
					gte: monthStart,
					lt: nextMonthStart,
				},
			},
			_sum: {
				maintenance: true,
				electricalEnergy: true,
				cleaning: true,
				totalValue: true,
			},
		}),
	]);

	const roomsRevenueById = new Map<string, EnterpriseValuesRoomRevenue>(
		rooms.map((room) => [
			room.id,
			{
				id: room.id,
				room: room.title,
				totalRevenue: 0,
				revenue: {
					byHour: 0,
					_week: 0,
					byMonth: 0,
				},
			},
		])
	);

	for (const rental of monthlyRentals) {
		const currentRoom = roomsRevenueById.get(rental.roomId);

		if (!currentRoom) {
			continue;
		}

		const rentalValue = parseFloat(rental.totalPrice.toString());
		currentRoom.totalRevenue += rentalValue;

		if (rental.allocationType === "DAILY") {
			currentRoom.revenue.byHour += rentalValue;
			continue;
		}

		if (rental.allocationType === "WEEK") {
			currentRoom.revenue._week += rentalValue;
			continue;
		}

		currentRoom.revenue.byMonth += rentalValue;
	}

	const roomsRevenue = rooms.map((room) => roomsRevenueById.get(room.id)!);
	const totalRevenue = roomsRevenue.reduce((accumulator, room) => accumulator + room.totalRevenue, 0);

	const expenses = {
		maintenance: parseFloat(expensesSummary._sum.maintenance?.toString() ?? "0"),
		eletricalEnergy: parseFloat(expensesSummary._sum.electricalEnergy?.toString() ?? "0"),
		cleaning: parseFloat(expensesSummary._sum.cleaning?.toString() ?? "0"),
		totalValue: parseFloat(expensesSummary._sum.totalValue?.toString() ?? "0"),
	};

	return {
		summary: {
			revenueThisMonth: totalRevenue,
			expensesThisMonth: expenses.totalValue,
			netIncome: totalRevenue - expenses.totalValue,
		},
		roomRevenue: {
			totalRevenue,
			roomsRevenue,
		},
		expenses,
		roomPrices: rooms.map((room) => ({
			id: room.id,
			room: room.title,
			price: {
				byHour: parseFloat(room.prices?.pricePerHour.toString() ?? "0"),
				_week: parseFloat(room.prices?.priceWeek.toString() ?? "0"),
				byMonth: parseFloat(room.prices?.pricePerMonth.toString() ?? "0"),
			},
		})),
	};
}
