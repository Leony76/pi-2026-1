export type StorePaymentHistory = {
	from: 'ROOM_RENTAL',
	paymentMethod: "PIX" | "BANK_SLIP" | "CREDIT_CARD",
	professionalId: string;
	paid: number;
}