import { SPECIALTY_MAP } from "../consts/user/specialty.const";

export function normalizeSpecialty(specialty: string): string {
	const cleanedSpecialty = specialty.trim();
	const mapKey = cleanedSpecialty.toLowerCase().replace(/[^a-z]/g, "");

	return SPECIALTY_MAP[mapKey] ?? cleanedSpecialty;
}
