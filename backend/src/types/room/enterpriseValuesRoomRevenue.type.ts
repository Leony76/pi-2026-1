export type EnterpriseValuesRoomRevenue = {
	id: string;
	room: string;
	totalRevenue: number;
	revenue: {
		byHour: number;
		_week: number;
		byMonth: number;
	};
};