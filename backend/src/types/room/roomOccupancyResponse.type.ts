export type RoomOccupancyResponse = {
	occupiedHours: { startHour: string; endHour: string }[];
	occupiedDays: string[];
};