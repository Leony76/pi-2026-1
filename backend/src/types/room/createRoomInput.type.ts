import { REVERSE_ROOM_ITEMS_LABEL_MAP } from "../../consts/room/service.consts";

export type CreateRoomInput = {
	roomName: string;
	roomImage?: string | null;
	floor: string;
	area: number;
	characteristics: string;
	pricePerHour: number;
	priceWeek: number;
	pricePerMonth: number;
	customItems: string[];
	items: {
		name: keyof typeof REVERSE_ROOM_ITEMS_LABEL_MAP;
		quantity: number;
	}[];
};

export type CreateRoomResponse = {
	id: string;
	displayImage: string | null;
	isAvailable: boolean;
	title: string;
	complementaryData: {
		area: number;
		additional: string;
		floor: string;
	};
	prices: {
		perHour: number;
		_week: number;
		month: number;
	};
}