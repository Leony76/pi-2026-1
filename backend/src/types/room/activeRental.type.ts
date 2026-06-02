import { AllocationType } from "@prisma/client";

export type ActiveRental = {
  id: string;
  allocationType: AllocationType;
  room: {
      title: string;
  };
  roomId: string;
  startDate: Date;
  endDate: Date;
  professional: {
      id: string;
      name: string;
      specialty: string;
  };
}

