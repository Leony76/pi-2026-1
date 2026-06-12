import prisma from "../../lib/prisma";
import { CreatePatientInput } from "../../types/patient/createPatientInput.type";

export class PatientRepository {

	public static async existsSessionConflict(
		professionalId: string,
		startsAt: Date,
		endsAt: Date
	) {
		return prisma.session.findFirst({
			where: {
				professionalId,
				AND: [
					{
						startsAt: {
							lt: endsAt,
						},
					},
					{
						endsAt: {
							gt: startsAt,
						},
					},
				],
			},
			select: {
				id: true,
			},
		});
	}



	public static async getOccupiedHours(
		professionalId: string,
		date: Date
	) {
		const startDay = new Date(date);
		startDay.setHours(0, 0, 0, 0);

		const endDay = new Date(date);
		endDay.setHours(23, 59, 59, 999);

		return prisma.session.findMany({
			where: {
				professionalId,
				startsAt: {
					gte: startDay,
					lte: endDay,
				},
			},
			select: {
				startsAt: true,
				endsAt: true,
			},
		});
	}



	public static async getActivePatients(
		professionalId: string,
		limit?: number
	) {
		return prisma.patient.findMany({
			where: {
				professionalId,
				sessions: {
					some: {
						startsAt: {
							gt: new Date(),
						},
					},
				},
			},
			select: {
				id: true,
				name: true,
				sessions: {
					where: {
						startsAt: {
							gt: new Date(),
						},
					},
					orderBy: {
						startsAt: "asc",
					},
					take: 1,
					select: {
						startsAt: true,
						endsAt: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			...(typeof limit === "number" && limit > 0 ? { take: limit } : {}),
		});
	}
	
	
	
	public static async getPatientHistory(
		professionalId: string,
		limit?: number
	) {
		return prisma.patient.findMany({
			where: {
				professionalId,
				sessions: {
					some: {
						endsAt: {
							lt: new Date(),
						},
					},
				},
				NOT: {
					sessions: {
						some: {
							startsAt: {
								gt: new Date(),
							},
						},
					},
				},
			},
			select: {
				id: true,
				name: true,
				updatedAt: true,
				sessions: {
					where: {
						endsAt: {
							lt: new Date(),
						},
					},
					orderBy: {
						endsAt: "desc",
					},
					take: 1,
					select: {
						startsAt: true,
						endsAt: true,
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
	
	
	
	public static async createPatient(
		professionalId: string, 
		data: CreatePatientInput
	) {
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
				status: "ACTIVE",
				sessions: {
					create: {
						startsAt       : data.startHour,
						endsAt         : data.endHour,		
						professionalId : data.professionalId,
					}
				}
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

