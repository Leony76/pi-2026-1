import { EntryExitBillingType } from "@prisma/client";

export type LatestEntryExit = {
  professional: {
    name: string;
  };
  room: {
    title: string;
  };
  enteredAt: Date;
  exitedAt: Date | null;
  sessionsCount: number;
  billingType: EntryExitBillingType;
}