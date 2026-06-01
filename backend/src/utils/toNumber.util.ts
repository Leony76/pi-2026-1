export function toNumber(value: { toString(): string }): number {
	return parseFloat(value.toString());
}