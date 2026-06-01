export type EnterpriseDashboardRoomOccupation = {
	id: string;
	isAvailable: boolean;
	occupant: string | null;
	title: string;
	occupation: {
		startTime: string | null;
		endTime: string | null;
	};
};