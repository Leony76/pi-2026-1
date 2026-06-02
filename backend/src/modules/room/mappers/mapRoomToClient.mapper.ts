import { translateCharacteristic } from "../../../utils/translateCharacteristics.util";
import { translateFloor } from "../../../utils/translateFloor.util";

export function mapRoomToClient(room: {
	id: string;
	displayImage: string | null;
	isAvailable: boolean;
	title: string;
	floor: string;
	area: { toString(): string };
	characteristic: string;
	prices: {
		pricePerHour: { toString(): string };
		priceWeek: { toString(): string };
		pricePerMonth: { toString(): string };
	} | null;
}) {
	return {
		id: room.id,
		displayImage: room.displayImage,
		isAvailable: room.isAvailable,
		title: room.title,
		complementaryData: {
			area: parseFloat(room.area.toString()),
			additional: translateCharacteristic(room.characteristic),
			floor: translateFloor(room.floor),
		},
		prices: room.prices
			? {
				perHour: parseFloat(room.prices.pricePerHour.toString()),
				_week: parseFloat(room.prices.priceWeek.toString()),
				month: parseFloat(room.prices.pricePerMonth.toString()),
			}
			: {
				perHour: 0,
				_week: 0,
				month: 0,
			},
	};
}