import { Expanses } from "../expenses.type";
import { RoomPrice } from "../room/roomPrice.type";
import { OverallRoomRevenue } from "../room/roomRevenue.type";

export type EnterpriseValuesResponse = {
  roomRevenue: OverallRoomRevenue;
  expenses: Expanses;
  roomPrices: RoomPrice[];
  summary: {
    revenueThisMonth: number;
    expensesThisMonth: number;
    netIncome: number;
  };
};