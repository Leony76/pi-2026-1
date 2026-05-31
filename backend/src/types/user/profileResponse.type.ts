import { ProfileStats } from "./profileStats.type";

export type ProfileResponse = {
	id: string;
	name: string;
	displayImage: string | null;
	specialty: string;
	specialtyLabel: string;
	accountType: "PROFESSIONAL" | "ENTERPRISE";
	crmCrp: string;
	email: string;
	phone: string | null;
	createdAt: string;
	updatedAt: string;
	stats: ProfileStats;
};