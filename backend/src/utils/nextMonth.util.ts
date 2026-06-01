export function nextMonth(date: Date): Date {
	const next = new Date(date);
	next.setMonth(next.getMonth() + 1);
	return next;
}