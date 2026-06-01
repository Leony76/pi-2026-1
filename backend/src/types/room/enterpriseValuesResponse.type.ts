import { EnterpriseValuesRoomPrice } from "./enterpriseValuesRoomPrice.type";
import { EnterpriseValuesRoomRevenue } from "./enterpriseValuesRoomRevenue.type";

export type EnterpriseValuesResponse = {
	summary: {
		revenueThisMonth: number;
		expensesThisMonth: number;
		netIncome: number;
	};
	roomRevenue: {
		totalRevenue: number;
		roomsRevenue: EnterpriseValuesRoomRevenue[];
	};
	expenses: {
		maintenance: number;
		eletricalEnergy: number;
		cleaning: number;
		totalValue: number;
	};
	roomPrices: EnterpriseValuesRoomPrice[];
};