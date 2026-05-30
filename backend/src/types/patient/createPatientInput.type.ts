export type CreatePatientInput = {
	name: string;
	phone: string;
	email?: string | null;
	initialDate: string | Date;
	observations?: string | null;
};