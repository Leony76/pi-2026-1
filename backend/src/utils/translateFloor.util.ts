import { FLOOR_TRANSLATIONS } from "../consts/room/service.consts";

export function translateFloor(floor: string): string {
	return FLOOR_TRANSLATIONS[floor] || floor;
}