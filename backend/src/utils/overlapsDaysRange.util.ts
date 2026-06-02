export function overlapsDateRange(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
	return startA < endB && startB < endA;
}