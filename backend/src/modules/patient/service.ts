import { createHttpError } from "../../lib/http-error";
import { toNumber } from "../../utils/toNumber.util";
import { CreatePatientInput } from "../../types/patient/createPatientInput.type";
import { PatientRepository } from "./repository";
import { getPatientMapper } from "./mappers/getPatient.mapper";

function normalizeDate(value: unknown, fieldName: string): Date {
	const date = new Date(value as string | number | Date);

	if (Number.isNaN(date.getTime())) {
		throw createHttpError(400, "bad_request", `Campo ${fieldName} invalido.`);
	}

	return date;
}

export class PatientService {

	public static async getActivePatients(professionalId: string, limit?: number) {
	
		const patients = await PatientRepository.getActivePatients(professionalId, limit);
	
		return patients.map((patient) => {
			const nextSession = patient.sessions[0];
	
			return {
				id: patient.id,
				name: patient.name,
				status: 'ACTIVE',
				nextSession: nextSession
					? {
						startHour: nextSession.startsAt.toISOString(),
						endHour: nextSession.endsAt.toISOString(),
					}
					: null,
			};
		});
	}
	
	

	public static async getOccupiedHours(
		professionalId: string,
		date: Date
	) {
		return PatientRepository.getOccupiedHours(
			professionalId,
			date
		);
	}

	
	public static async getPatientHistory(professionalId: string, limit?: number) {
	
		const patients = await PatientRepository.getPatientHistory(professionalId, limit);
	
		return patients.map((patient) => ({
			id: patient.id,
			patientName: patient.name,
			status: 'CLOSED',
			lastSession: {
				startHour: patient.sessions[0]?.startsAt?.toISOString() ?? patient.updatedAt.toISOString(),
				endHour: patient.sessions[0]?.endsAt?.toISOString() ?? patient.updatedAt.toISOString(),
			}
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
		const totalGenerated = completedSessions.reduce((acc, session) => acc + toNumber(session.price ?? 0), 0);
	
		return getPatientMapper({
			...patient,
			completedSessions,
			totalGenerated,
			upcomingSessions,
			lastSession,
		});
	}
	
	
	
	public static async createPatient(
		professionalId: string, 
		data: CreatePatientInput
	) {
		const name = data.name?.trim();
		const phone = data.phone?.trim();
		const email = data.email?.trim() || null;
		const observations = data.observations?.trim() || null;
		const startHour = normalizeDate(data.startHour, "startHour");
		const endHour = normalizeDate(data.endHour, "endHour");

	
		if (!name || name.length < 3) {
			throw createHttpError(400, "bad_request", "Nome invalido.");
		} if (!phone) {
			throw createHttpError(400, "bad_request", "Telefone invalido.");
		} 

		const conflict = await PatientRepository.existsSessionConflict(
			professionalId,
			startHour,
			endHour
		);

		if (conflict) {
			throw createHttpError(409, "conflict", "Já existe uma sessão nesse horário.");
		}
	
		const createdPatient = await PatientRepository.createPatient(professionalId, {
			professionalId: data.professionalId,
			startHour,
			endHour,
			name,
			phone,
			email,
			observations,
		});
	
		return {
			...createdPatient,
			initialDate: createdPatient.initialDate?.toISOString(),
			createdAt: createdPatient.createdAt.toISOString(),
		};
	}
}

