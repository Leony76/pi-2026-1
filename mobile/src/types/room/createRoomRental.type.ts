export type CreateRoomRental = {
  roomId: string;
  allocationType: "DAILY" | "WEEK" | "MONTH";
  paymentMethod?: "PIX" | "BANK_SLIP" | "CREDIT_CARD";
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  selectedWeekDays?: string[];
}