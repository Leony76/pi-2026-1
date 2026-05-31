import { AccountType } from "@prisma/client";

export type UserInfos = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  crmCrp: string;
  email: string;
  specialty: string;
  accountType: AccountType;
  phone: string | null;
  displayImage: string | null;
}