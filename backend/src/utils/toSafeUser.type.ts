import { normalizeSpecialty } from "./normalizeSpecialty.util";
import { SafeUser } from "../types/auth/safeUser.type";

export function toSafeUser(user: {
	id: string;
	name: string;
	specialty: string;
	accountType?: "PROFESSIONAL" | "ENTERPRISE";
	crmCrp: string;
	email: string;
	emailVerifiedAt: Date | null;
	createdAt: Date;
}): SafeUser {
	const accountType = user.accountType ?? "PROFESSIONAL";

	return {
		id: user.id,
		name: user.name,
		specialty: normalizeSpecialty(user.specialty),
		accountType,
		crmCrp: user.crmCrp,
		email: user.email,
		emailVerifiedAt: user.emailVerifiedAt,
		createdAt: user.createdAt,
	};
}