import { UserRentalTotalPrice } from "../../../types/room/userRentalTotalPrice.type";
import { UserInfos } from "../../../types/user/userInfos.type";
import { normalizeSpecialty } from "../../shared/specialty";

export const buildProfileMapper = (
  user: UserInfos,
  sessions: number,
  patients: number,
  rentals: UserRentalTotalPrice,
) => {
  return {
    id: user.id,
    displayImage: user.displayImage ?? null,
    name: user.name,
    specialty: user.specialty,
    specialtyLabel: normalizeSpecialty(user.specialty),
    accountType: user.accountType,
    crmCrp: user.crmCrp,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    stats: {
      sessions,
      patients,
      totalSpent: Number(rentals._sum.totalPrice?.toString() ?? "0"),
    },
  };
}