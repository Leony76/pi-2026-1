import { formatLocalDate } from "./formatLocalDate.util";

export function getDateRangeKeys(startDate: Date, endDate: Date): string[] {
	const keys: string[] = [];
	const currentDate = new Date(startDate);
	currentDate.setUTCHours(0, 0, 0, 0);

	const finalDate = new Date(endDate);
	finalDate.setUTCHours(0, 0, 0, 0);

	if (finalDate > currentDate) {
		finalDate.setUTCDate(finalDate.getUTCDate() - 1);
	}

	while (currentDate <= finalDate) {
		keys.push(formatLocalDate(currentDate));
		currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	}

	return keys;
}