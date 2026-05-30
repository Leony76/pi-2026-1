import prisma from "../../lib/prisma";
import { CreatePatientInput } from "../../types/patient/createPatientInput.type";

export class PatientRepository {

	public static async getActivePatients(professionalId: string, limit?: number) {
		return await prisma.patient.findMany({
			where: {
				professionalId,
				status: "ACTIVE",
			},
			select: {
				id: true,
				name: true,
				status: true,
				nextSessionAt: true,
				initialDate: true,
				sessions: {
					where: {
						startsAt: {
							gte: new Date(),
						},
					},
					orderBy: {
						startsAt: "asc",
					},
					take: 1,
					select: {
						startsAt: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			...(typeof limit === "number" && limit > 0 ? { take: limit } : {}),
		});
	}
	
	
	
	public static async getPatientHistory(professionalId: string, limit?: number) {
		return await prisma.patient.findMany({
			where: {
				professionalId,
				status: "CLOSED",
			},
			select: {
				id: true,
				name: true,
				updatedAt: true,
				sessions: {
					where: {
						startsAt: {
							lte: new Date(),
						},
					},
					orderBy: {
						startsAt: "desc",
					},
					take: 1,
					select: {
						startsAt: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
			...(typeof limit === "number" && limit > 0 ? { take: limit } : {}),
		});
	}
	
	
	
	public static async getPatientById(professionalId: string, patientId: string) {
		return await prisma.patient.findFirst({
			where: {
				id: patientId,
				professionalId,
			},
			select: {
				id: true,
				name: true,
				phone: true,
				status: true,
				createdAt: true,
				sessions: {
					orderBy: {
						startsAt: "asc",
					},
					select: {
						startsAt: true,
						endsAt: true,
						price: true,
						room: {
							select: {
								title: true,
							},
						},
					},
				},
			},
		});
	}
	
	
	
	public static async createPatient(professionalId: string, data: CreatePatientInput) {
    const name = data.name?.trim();
		const phone = data.phone?.trim();
		const email = data.email?.trim() || null;
		const observations = data.observations?.trim() || null;
    
		return await prisma.patient.create({
			data: {
				professionalId,
				name,
				phone,
				email,
				observations,
				initialDate: data.initialDate,
				status: "ACTIVE",
			},
			select: {
				id: true,
				name: true,
				phone: true,
				email: true,
				initialDate: true,
				observations: true,
				status: true,
				createdAt: true,
			},
		});
	}
}

