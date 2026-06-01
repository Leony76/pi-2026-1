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
		name: string;
		quantity: number;
	}[];
};