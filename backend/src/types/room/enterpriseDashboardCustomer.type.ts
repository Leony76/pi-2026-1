export type EnterpriseDashboardCustomer = {
	id: string;
	name: string;
	specialty: string;
	occupiedRoom: string | null;
	occupation: {
		startHour: string | null;
		endHour: string | null;
		limitDate: string | null;
	};
};