import { createHttpError } from "../../lib/http-error";
import { toNumber } from "../../utils/toNumber.util";
import { CreatePatientInput } from "../../types/patient/createPatientInput.type";
import { parseDateOrThrow } from "../../utils/parseDateOrThrow.util";
import { PatientRepository } from "./repository";
import { getPatientMapper } from "./mappers/getPatient.mapper";

export class PatientService {

	public static async getActivePatients(professionalId: string, limit?: number) {
	
		const patients = await PatientRepository.getActivePatients(professionalId, limit);
	
		return patients.map((patient) => {
			const next = patient.nextSessionAt ?? patient.sessions[0]?.startsAt ?? null;
	
			return {
				id: patient.id,
				name: patient.name,
				status: patient.status,
				nextSession: next ? next.toISOString() : null,
			};
		});
	}
	
	
	
	public static async getPatientHistory(professionalId: string, limit?: number) {
	
		const patients = await PatientRepository.getPatientHistory(professionalId, limit);
	
		return patients.map((patient) => ({
			id: patient.id,
			patientName: patient.name,
			lastSession: (patient.sessions[0]?.startsAt ?? patient.updatedAt).toISOString(),
			status: "CLOSED" as const,
		}));
	}
	
	
	
	public static async getPatientById(professionalId: string, patientId: string) {
		const now = new Date();
	
		const patient = await PatientRepository.getPatientById(professionalId, patientId);
	
		if (!patient) {
			return null;
		}
	
		const completedSessions = patient.sessions.filter((session) => session.startsAt <= now);
		const upcomingSessions = patient.sessions.filter((session) => session.startsAt > now);
		const lastSession = completedSessions[completedSessions.length - 1];
		const totalGenerated = completedSessions.reduce((acc, session) => acc + toNumber(session.price), 0);
	
		return getPatientMapper({
			...patient,
			completedSessions,
			totalGenerated,
			upcomingSessions,
			lastSession,
		});
	}
	
	
	
	public static async createPatient(professionalId: string, data: CreatePatientInput) {
		const name = data.name?.trim();
		const phone = data.phone?.trim();
		const email = data.email?.trim() || null;
		const observations = data.observations?.trim() || null;
	
		if (!name || name.length < 3) {
			throw createHttpError(400, "bad_request", "Nome invalido.");
		} if (!phone) {
			throw createHttpError(400, "bad_request", "Telefone invalido.");
		} 
	
		const initialDate = parseDateOrThrow(String(data.initialDate), "initialDate");
	
		const createdPatient = await PatientRepository.createPatient(professionalId, {
			initialDate,
			name,
			phone,
			email,
			observations,
		});
	
		return {
			...createdPatient,
			initialDate: createdPatient.initialDate.toISOString(),
			createdAt: createdPatient.createdAt.toISOString(),
		};
	}
}

