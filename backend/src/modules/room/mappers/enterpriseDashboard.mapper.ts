import { LatestEntryExit } from "../../../types/room/latestEntryExit.type";
import { HistoryRental } from "../../../types/room/historyRental.type";
import { ActiveRental } from "../../../types/room/activeRental.type";
import { RoomBrief } from "../../../types/room/roomInfos.type";

type MapperRequest = {
  rooms: RoomBrief[];
  activeRentals: ActiveRental[];
  historyRentals: HistoryRental[];
  latestEntryExit: LatestEntryExit | undefined;
  entriesToday: number;
  exitsToday: number;
};

export const enterpriseDashboardMapper = (
  data: MapperRequest
) => {
  const {
    rooms,
    activeRentals,
    historyRentals,
    latestEntryExit,
    entriesToday,
    exitsToday,
  } = data;

  const rentalsByRoom = new Map<string, typeof activeRentals>();

  for (const rental of activeRentals) {
    const current = rentalsByRoom.get(rental.roomId) ?? [];

    current.push(rental);

    rentalsByRoom.set(
      rental.roomId,
      current
    );
  }

  const roomOccupation = rooms.map((room) => {
    const roomRentals = activeRentals.filter(
      (rental) => rental.roomId === room.id
    );

    const professionalsMap = new Map();

    for (const rental of roomRentals) {
      const professionalId = rental.professional.id;

      if (!professionalsMap.has(professionalId)) {
        professionalsMap.set(professionalId, {
          professionalId,
          name: rental.professional.name,
          specialty: rental.professional.specialty,
          allocations: [],
        });
      }

      professionalsMap.get(professionalId).allocations.push({
        type: rental.allocationType,
        startDate: rental.startDate.toISOString(),
        endDate: rental.endDate.toISOString(),
      });
    }

    return {
      id: room.id,
      title: room.title,
      isAvailable: roomRentals.length === 0,
      occupants: Array.from(professionalsMap.values()),
    };
  });

  const activeCustomers = activeRentals.map((rental) => ({
    id: rental.roomId,
    name: rental.professional.name,
    specialty: rental.professional.specialty,
    occupiedRoom: rental.room.title,
    allocationType: rental.allocationType,
    occupation: {
      startHour: rental.startDate.toISOString(),
      endHour: rental.endDate.toISOString(),
      limitDate: rental.endDate.toISOString(),
    },
  }));

  const historyCustomers = historyRentals.map((rental) => ({
    id: rental.id,
    name: rental.professional.name,
    specialty: rental.professional.specialty,
    allocationType: rental.allocationType,
    occupiedRoom: rental.room.title,
    startDate: rental.startDate.toISOString(),
    endDate: rental.endDate.toISOString(),
    unoccupiedRoomAt: rental.endDate.toISOString(),
  }));

  const availableRooms = roomOccupation.filter(
    (room) => room.isAvailable
  ).length;

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
          exit:
            latestEntryExit.exitedAt?.toISOString() ??
            latestEntryExit.enteredAt.toISOString(),
          sessions: latestEntryExit.sessionsCount,
          totalValue: latestEntryExit.billingType,
        }
      : null,
  };
}
