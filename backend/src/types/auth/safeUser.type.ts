export type SafeUser = {
	id: string;
	name: string;
	specialty: string;
	accountType: "PROFESSIONAL" | "ENTERPRISE";
	crmCrp: string;
	email: string;
	emailVerifiedAt: Date | null;
	createdAt: Date;
};