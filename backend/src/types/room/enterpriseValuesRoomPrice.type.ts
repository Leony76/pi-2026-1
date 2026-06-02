export type EnterpriseValuesRoomPrice = {
	id: string;
	room: string;
	price: {
		byHour: number;
		_week: number;
		byMonth: number;
	};
};