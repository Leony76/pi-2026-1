import { Specialty } from "@/constants/maps/selectOptions.map";
import { EnterpriseRoomOccupation } from "../room/enterpriseRoomOccupation.type";
import { RoomOccupation } from "../room/roomOccupation.type";
import { Allocation } from "../room/allocation.type";

export type EnterpriseDashboardResponse = {
  stats: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    entriesToday: number;
    exitsToday: number;
  };
  roomOccupation: RoomOccupation[];
  activeCustomers: {
    id: string;
    name: string;
    specialty: Specialty;
    occupiedRoom: string | null;
    allocationType: Allocation;
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
    allocationType: Allocation;
    startDate : string;
    endDate   : string;
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