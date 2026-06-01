import { HourShift } from "./hourShift.type";

export type RoomOccupancyResponse = {
	occupiedHours: HourShift[];
	occupiedDays: string[];
};