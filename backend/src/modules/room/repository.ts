import prisma from "../../lib/prisma";
import { Floor, Prisma, RoomCharacteristic, WeekDay } from "@prisma/client";
import { createHttpError } from "../../lib/http-error";
import { REVERSE_ROOM_ITEMS_LABEL_MAP } from "../../consts/room/service.consts";
import { RoomOccupancyResponse } from "../../types/room/roomOccupancyResponse.type";
import { getDateRangeKeys } from "../../utils/getDateRangeKeys.util";
import { toPrismaAllocationType } from "../../utils/toPrismaAllocationType.util";
import { UpdateRoom } from "../../types/room/updateRoom.type";
import { nextDay } from "../../utils/nextDay.util";
import { nextMonth } from "../../utils/nextMonth.util";
import { startOfDay } from "../../utils/startOfDay.util";
import { startOfMonth } from "../../utils/startOfMonth.util";
import { CreateRoomRental } from "../../types/room/createRoomRental.type";

export class RoomRepository {

  public static async getUserAccountTypeById(id: string) {
    return await prisma.user.findUnique({
			where: { id },
			select: { accountType: true },
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
				orderBy: { createdAt: "asc" },
			}),

			prisma.roomRental.findMany({
				where: {
					startDate: { lte: now },
					endDate: { gte: now },
				},
				select: {
					id: true,
					roomId: true,
					startDate: true,
					endDate: true,
					allocationType: true,
					professional: {
						select: {
							id: true,
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
					endDate: { lt: now },
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
						select: { title: true },
					},
				},
				orderBy: { endDate: "desc" },
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
						select: { name: true },
					},
					room: {
						select: { title: true },
					},
				},
				orderBy: { enteredAt: "desc" },
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
					select: { name: true },
				},
				room: {
					select: { title: true },
				},
			},
			orderBy: { enteredAt: "desc" },
			take: 1,
		});
  }


	public static async roomRentalsByEndDate() {
    return await prisma.roomRental.findMany({
			where: {
				endDate: { lt: new Date() },
			},
			select: {
				id: true,
				endDate: true,
				startDate: true,
				allocationType: true,
				professional: {
					select: {
						name: true,
						specialty: true,
					},
				},
				room: {
					select: { title: true },
				},
			},
			orderBy: { endDate: "desc" },
		});
  }
	
	public static async getRoomOccupancy(roomId: string): Promise<RoomOccupancyResponse> {
		const room = await prisma.room.findUnique({
			where: { id: roomId },
			select: { id: true },
		});
	
		if (!room) {
			throw createHttpError(404, "not_found", "Sala não encontrada!");
		}
	
		const now = new Date();
		const activeRentals = await prisma.roomRental.findMany({
			where: {
				roomId,
				endDate: { gte: now },
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
			select: { isAvailable: true },
		})
  }



  public static async overlappingRental(roomId: string, startDate: Date, endDate: Date) {
    return await prisma.roomRental.findFirst({
      where: {
        roomId,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
      select: { id: true },
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
				isAvailable: true,
				characteristic: true,
				prices: {
					select: {
						pricePerHour: true,
						priceWeek: true,
						pricePerMonth: true,
					},
				},
			},
			orderBy: { createdAt: "asc" },
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
				endDate: { gte: new Date() },
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
	
	
	
	public static async getRoomDetailsById(roomId : string) {
		return await prisma.room.findUnique({
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
	}
	
	
	
	public static async updateRoomById(
		roomId: string,
		data: UpdateRoom,
	) {
		return await prisma.room.update({
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
			data  : { isAvailable: status }
		});
	}
	
	
	
	public static async getUserRentals(professionalId: string) {
		return await prisma.roomRental.findMany({
			where: { professionalId },
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
			orderBy: { startDate: "desc" },
		});
	}
	
	
	
	public static async getEnterpriseValues() {
	
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

		return {
			rooms,
			monthlyRentals,
			expensesSummary,
		}
	}
}

