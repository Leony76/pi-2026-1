import prisma from "../../lib/prisma";
import { Floor, Prisma, RoomCharacteristic, RoomItemName, WeekDay } from "@prisma/client";
import { createHttpError } from "../../lib/http-error";
import { REVERSE_ROOM_ITEMS_LABEL_MAP, FLOOR_MAP, CHARACTERISTIC_MAP, ROOM_ITEM_MAP, ROOM_ITEMS_LABEL_MAP } from "../../consts/room/service.consts";
import { EnterpriseDashboardResponse } from "../../types/room/enterpriseDashboardResponse.type";
import { RoomInfos } from "../../types/room/roomInfos.type";
import { RoomOccupancyResponse } from "../../types/room/roomOccupancyResponse.type";
import { getDateRangeKeys } from "../../utils/getDateRangeKeys.util";
import { isValidRoomImageUrl } from "../../utils/isValidRoomImageUrl.util";
import { toPrismaAllocationType } from "../../utils/toPrismaAllocationType.util";
import { toWeekDays } from "../../utils/toWeekDays.util";
import { mapRoomToClient } from "./mappers/mapRoomToClient.mapper";
import { mapRoomRentalToClient } from "./mappers/roomRentalToClient.mapper";
import { EnterpriseValuesResponse } from "../../types/room/enterpriseValuesResponse.type";
import { EnterpriseValuesRoomRevenue } from "../../types/room/enterpriseValuesRoomRevenue.type";
import { UpdateRoom } from "../../types/room/updateRoom.type";
import { nextDay } from "../../utils/nextDay.util";
import { nextMonth } from "../../utils/nextMonth.util";
import { startOfDay } from "../../utils/startOfDay.util";
import { startOfMonth } from "../../utils/startOfMonth.util";
import { NewRoom } from "../../types/room/newRoom.type";
import { CreateRoomRental } from "../../types/room/createRoomRental.type";

export class RoomRepository {

  public static async getUserAccountTypeById(id: string) {
    return await prisma.user.findUnique({
			where: { id },
			select: {
				accountType: true,
			},
		});
  }

	public static async getEnterpriseDashboard() {
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

    return {
      rooms,
      activeRentals,
      _historyRentals,
      entriesToday,
      exitsToday,
      _latestEntryExit,
    };
	}
	

  public static async lastEntryExit() {
    const dayStart = startOfDay(new Date());
		const dayEnd = nextDay(dayStart);

    return await prisma.entryExit.findMany({
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
		});
  }


	public static async roomRentalsByEndDate() {
    return await prisma.roomRental.findMany({
			where: {
				endDate: {
					lt: new Date(),
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
		});
  }
	
	public static async getRoomOccupancy(roomId: string): Promise<RoomOccupancyResponse> {
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
	
	

  public static async getRoomAvailabilityById(id: string) {
    return await prisma.room.findUnique({
			where: { id },
			select: {
				isAvailable: true,
			},
		})
  }



  public static async overlappingRental(roomId: string, startDate: Date, endDate: Date) {
    return await prisma.roomRental.findFirst({
      where: {
        roomId,
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
    })
  }


	
	public static async getRoomsList() {
		return await prisma.room.findMany({
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
	}
	
	
	
	public static async createRoom(data: Prisma.RoomCreateInput) {
    return prisma.room.create({
      data,
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
  }
  


  public static async getRoomActiveRentals(roomId: string) {
    return await prisma.roomRental.findMany({
			where: {
				roomId,
				endDate: {
					gte: new Date(),
				},
			},
			select: {
				selectedWeekDay: true,
				startDate: true,
				endDate: true,
			},
		})
  }



  public static async findRoomById(id: string) {
    return await prisma.room.findUnique({
			where: { id },
			select: { id: true },
		})
  }



	public static async findRoomByName(
    enterpriseOwnerId: string,
    roomName: string
  ) {
    return prisma.room.findFirst({
      where: {
        enterpriseOwnerId,
        title: roomName,
      },
    });
  }
	
	public static async createRoomRental(data: CreateRoomRental & {
    selectedWeekDays: WeekDay[];
    startDate: Date;
    endDate: Date;
  }) {
		return await prisma.roomRental.create({
			data: {
				professionalId: data.professionalId,
				roomId: data.roomId,
				allocationType: toPrismaAllocationType(data.allocationType),
				paymentMethod: data.paymentMethod ?? null,
				startDate: data.startDate,
				endDate: data.endDate,
				totalPrice: data.totalPrice.toString(),
				selectedWeekDay: data.selectedWeekDays,
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
		})
	}
	
	
	
	public static async getRoomDetailsById(roomId : string): Promise<RoomInfos> {
		const room = await prisma.room.findUnique({
			where: { id: roomId },
			select: { 
				title: true,
				area: true,
				characteristic: true,
				floor: true,
				displayImage: true,
				customItems: { select: { name: true }},
				prices: {
					select: {
						pricePerHour: true,
						pricePerMonth: true,
						priceWeek: true,
					}
				},
				items: {
					select: {
						name     : true,
						quantity : true,
					}
				} 
			},
		});
	
		if (!room) throw new Error("Não foi possível achar a sala");
	
		return {
			floor: room.floor,
			roomName: room.title,
			area: room.area.toNumber(),
			characteristics: room.characteristic,
			image: room.displayImage,
			pricePerHour: room.prices?.pricePerHour.toNumber() ?? 0,
			pricePerMonth: room.prices?.pricePerMonth.toNumber() ?? 0,
			priceWeek: room.prices?.priceWeek.toNumber() ?? 0,
			customItems: room.customItems.map((item) => item.name),
			items: room.items.map((item) => ({
				quantity: item.quantity,
				name: ROOM_ITEMS_LABEL_MAP[item.name]
			}))
		}
	}
	
	
	
	public static async updateRoomById(
		roomId: string,
		data: UpdateRoom,
	): Promise<void> {
	
		await prisma.room.update({
			where: { id: roomId },
			data: {
				area: data.area,
				characteristic: data.characteristics as RoomCharacteristic,
				displayImage: data.roomImage ?? null,
				floor: data.floor as Floor,
				title: data.roomName,
				customItems: {
					deleteMany: {},
					create: data.customItems.map((item) => ({
						name: item,
					})),
				},
				items: {
					deleteMany: {},
					create: data.items.map((item) => ({
						name: REVERSE_ROOM_ITEMS_LABEL_MAP[item.name],
						quantity: item.quantity,
					})),
				},
	
				prices: {
					upsert: {
						update: {
							pricePerHour: data.pricePerHour,
							priceWeek: data.priceWeek,
							pricePerMonth: data.pricePerMonth,
						},
	
						create: {
							pricePerHour: data.pricePerHour,
							priceWeek: data.priceWeek,
							pricePerMonth: data.pricePerMonth,
						},
					},
				},
			},
		});
	}
	
	
	
	public static async toggleRoomAvailabilityById(
		roomId: string,
		status: boolean,
	) {
		return await prisma.room.update({
			where : { id: roomId },
			data  : {
				isAvailable: status
			}
		});
	}
	
	
	
	public static async getUserRentals(professionalId: string) {
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
	
	
	
	public static async getEnterpriseValues(userId: string): Promise<EnterpriseValuesResponse> {
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
}

