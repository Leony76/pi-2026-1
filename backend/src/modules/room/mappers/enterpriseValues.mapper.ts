import { EnterpriseValuesRoomRevenue } from "../../../types/room/enterpriseValuesRoomRevenue.type";
import { ExpansesSummary } from "../../../types/room/expansesSummary.type";
import { MonthyRentals } from "../../../types/room/monthyRentals.type";
import { RoomPrices } from "../../../types/room/roomInfos.type";


export const enterpriseValuesMapper = (
  expensesSummary: ExpansesSummary,
  monthlyRentals: MonthyRentals[],
  rooms: RoomPrices[],
) => {
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

    if (!currentRoom) continue;

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