import { AllocationType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export type MonthyRentals = {
  roomId: string;
  totalPrice: Decimal;
  allocationType: AllocationType;
  room: {
      title: string;
  };
}