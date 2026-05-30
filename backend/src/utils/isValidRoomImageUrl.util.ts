export function isValidRoomImageUrl(value: string): boolean {
	return value.startsWith("data:image/") || /^https?:\/\//.test(value);
}