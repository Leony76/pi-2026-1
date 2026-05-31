import { Prisma } from "@prisma/client";

export type UserRentalTotalPrice = Prisma.GetRoomRentalAggregateType<{
  where: {
    professionalId: string;
  };
  _sum: {
    totalPrice: true;
  };
}>;
