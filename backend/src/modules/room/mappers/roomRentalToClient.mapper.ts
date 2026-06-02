import { WeekDay } from "@prisma/client";
import { getDateRangeKeys } from "../../../utils/getDateRangeKeys.util";
import { toClientAllocationType } from "../../../utils/toClientAllocationType.util";
import { translateCharacteristic } from "../../../utils/translateCharacteristics.util";
import { translateFloor } from "../../../utils/translateFloor.util";

export function mapRoomRentalToClient(rental: {
	id: string;
	room: {
		title: string;
		floor: string;
		characteristic: string;
	};
	allocationType: string;
	startDate: Date;
	endDate: Date;
	totalPrice: { toString(): string };
	selectedWeekDay: WeekDay[];
}) {
	const selectedWeekDays = getDateRangeKeys(rental.startDate, rental.endDate);

	return {
		id: rental.id,
		roomTitle: rental.room.title,
		roomFloor: translateFloor(rental.room.floor),
		roomCharacteristic: translateCharacteristic(rental.room.characteristic),
		allocationType: toClientAllocationType(rental.allocationType),
		startDate: rental.startDate,
		endDate: rental.endDate,
		totalPrice: parseFloat(rental.totalPrice.toString()),
		selectedWeekDays,
		isActive: new Date() >= rental.startDate && new Date() <= rental.endDate,
	};
}