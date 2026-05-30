export function startOfMonth(date: Date): Date {
	const monthStart = new Date(date);
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);
	return monthStart;
}