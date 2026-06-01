import { WeekDay } from "@prisma/client";

export function toWeekDays(days?: string[]): WeekDay[] {
	if (!days) {
		return [];
	}

	const validDays = Object.values(WeekDay);
	return days.filter((day): day is WeekDay => validDays.includes(day as WeekDay));
}