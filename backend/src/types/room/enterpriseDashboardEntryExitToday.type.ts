export type EnterpriseDashboardEntryExitToday = {
	occupantName: string;
	room: string;
	entry: string;
	exit: string;
	sessions: number;
	totalValue: "DAILY" | "WEEKLY" | "MONTHLY";
} | null;