import { EnterpriseDashboardCustomer } from "./enterpriseDashboardCustomer.type";
import { EnterpriseDashboardCustomerHistory } from "./enterpriseDashboardCustomerHistory.type";
import { EnterpriseDashboardEntryExitToday } from "./enterpriseDashboardEntryExitToday.type";
import { EnterpriseDashboardRoomOccupation } from "./enterpriseDashboardRoomOcuupation.type";

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