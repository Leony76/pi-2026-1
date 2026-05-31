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

  const activeRentalByRoomId = new Map(
    activeRentals.map((rental) => [rental.roomId, rental])
  );

  const roomOccupation = rooms.map((room) => {
    const activeRental = activeRentalByRoomId.get(room.id);

    return {
      id: room.id,
      isAvailable: activeRental ? false : room.isAvailable,
      occupant: activeRental?.professional.name ?? null,
      title: room.title,
      occupation: {
        startTime: activeRental?.startDate.toISOString() ?? null,
        endTime: activeRental?.endDate.toISOString() ?? null,
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

  const historyCustomers = historyRentals.map((rental) => ({
    id: rental.id,
    name: rental.professional.name,
    specialty: rental.professional.specialty,
    occupiedRoom: rental.room.title,
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
