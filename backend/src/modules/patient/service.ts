import prisma from "../../lib/prisma";
import { createHttpError } from "../../lib/http-error";

type CreatePatientInput = {
	name: string;
	phone: string;
	email?: string;
	initialDate: string;
	observations?: string;
};

function parseDateOrThrow(rawDate: string, fieldName: string): Date {
	const parsedDate = new Date(rawDate);

	if (Number.isNaN(parsedDate.getTime())) {
		throw createHttpError(400, "bad_request", `Campo ${fieldName} invalido.`);
	}

	return parsedDate;
}

function toNumber(value: { toString(): string }): number {
	return parseFloat(value.toString());
}

export async function getActivePatients(professionalId: string, limit?: number) {
	const now = new Date();

	const patients = await prisma.patient.findMany({
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
						gte: now,
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

export async function getPatientHistory(professionalId: string, limit?: number) {
	const now = new Date();

	const patients = await prisma.patient.findMany({
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
						lte: now,
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

	return patients.map((patient) => ({
		id: patient.id,
		patientName: patient.name,
		lastSession: (patient.sessions[0]?.startsAt ?? patient.updatedAt).toISOString(),
		status: "CLOSED" as const,
	}));
}

export async function getPatientById(professionalId: string, patientId: string) {
	const now = new Date();

	const patient = await prisma.patient.findFirst({
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

	if (!patient) {
		return null;
	}

	const completedSessions = patient.sessions.filter((session) => session.startsAt <= now);
	const upcomingSessions = patient.sessions.filter((session) => session.startsAt > now);
	const lastSession = completedSessions[completedSessions.length - 1];
	const totalGenerated = completedSessions.reduce((acc, session) => acc + toNumber(session.price), 0);

	return {
		id: patient.id,
		name: patient.name,
		phone: patient.phone,
		status: patient.status,
		createdAt: patient.createdAt.toISOString(),
		sessionHistory: {
			totalMade: completedSessions.length,
			session:
				completedSessions.length === 0
					? null
					: {
							lastOneDate: (lastSession!.startsAt).toISOString(),
							valueByEach: lastSession ? toNumber(lastSession.price) : 0,
							totalGenerated,
						},
		},
		sessions: upcomingSessions.map((session) => ({
			date: session.startsAt.toISOString(),
			room: session.room.title,
			hour: {
				start: session.startsAt.toISOString(),
				end: session.endsAt.toISOString(),
			},
		})),
	};
}

export async function createPatient(professionalId: string, data: CreatePatientInput) {
	const name = data.name?.trim();
	const phone = data.phone?.trim();
	const email = data.email?.trim() || null;
	const observations = data.observations?.trim() || null;

	if (!name || name.length < 3) {
		throw createHttpError(400, "bad_request", "Nome invalido.");
	}

	if (!phone) {
		throw createHttpError(400, "bad_request", "Telefone invalido.");
	}

	const initialDate = parseDateOrThrow(data.initialDate, "initialDate");

	const createdPatient = await prisma.patient.create({
		data: {
			professionalId,
			name,
			phone,
			email,
			observations,
			initialDate,
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

	return {
		...createdPatient,
		initialDate: createdPatient.initialDate.toISOString(),
		createdAt: createdPatient.createdAt.toISOString(),
	};
}
