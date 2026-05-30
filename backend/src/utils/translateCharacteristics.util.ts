import { CHARACTERISTIC_TRANSLATIONS } from "../consts/room/service.consts";

export function translateCharacteristic(characteristic: string): string {
	return CHARACTERISTIC_TRANSLATIONS[characteristic] || characteristic;
}