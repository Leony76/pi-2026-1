import { AllocationType } from "@prisma/client";

export type HistoryRental = {
  id: string;
  room: {
      title: string;
  };
  allocationType: AllocationType;
  startDate: Date;
  endDate: Date;
  professional: {
      name: string;
      specialty: string;
  };
}