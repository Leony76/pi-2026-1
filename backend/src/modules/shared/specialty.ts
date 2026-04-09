const SPECIALTY_MAP: Record<string, string> = {
	generalmedicine: "Medicina geral",
	medicinageral: "Medicina geral",
	medicinegeneral: "Medicina geral",
	psychology: "Psicologia",
	psicologia: "Psicologia",
	dermatology: "Dermatologia",
	dermatologia: "Dermatologia",
	pediatrics: "Pediatria",
	pediatria: "Pediatria",
	orthopedics: "Ortopedia",
	ortopedia: "Ortopedia",
};

export function normalizeSpecialty(specialty: string): string {
	const cleanedSpecialty = specialty.trim();
	const mapKey = cleanedSpecialty.toLowerCase().replace(/[^a-z]/g, "");

	return SPECIALTY_MAP[mapKey] ?? cleanedSpecialty;
}
