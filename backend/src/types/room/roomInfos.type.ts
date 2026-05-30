export type RoomInfos = {
	roomName: string;
	image: string | null;
	floor: string;
	area: number;
	characteristics: string;
	pricePerHour: number;
	priceWeek: number;
	pricePerMonth: number;
	customItems: string[];
	items: {
		name: "Sofa / Divã" | "Cadeira" | "Computador" | "Maca" | "Armário" | "Banheiro" | "Ar-condi." | "TV / Monitor." | "Equip. médico" | "Espelho" | "Plantas" | "Ilumi. especial";
		quantity: number;
	}[];
}