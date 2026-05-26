import { Specialty } from "@/constants/maps/selectOptions.map";
import { EnterpriseRoomOccupation } from "../room/enterpriseRoomOccupation.type";

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