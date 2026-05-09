import prisma from "../../lib/prisma";
import { createHttpError } from "../../lib/http-error";
import { normalizeSpecialty } from "../shared/specialty";

type ProfileStats = {
	sessions: number;
	patients: number;
	totalSpent: number;
};

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

async function buildProfileResponse(userId: string): Promise<ProfileResponse | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			displayImage: true,
			name: true,
			specialty: true,
			accountType: true,
			crmCrp: true,
			email: true,
			phone: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) {
		return null;
	}

	const [sessions, patients, rentals] = await Promise.all([
		prisma.session.count({
			where: { professionalId: userId },
		}),
		prisma.patient.count({
			where: { professionalId: userId },
		}),
		prisma.roomRental.aggregate({
			where: { professionalId: userId },
			_sum: {
				totalPrice: true,
			},
		}),
	]);
	return {
		id: user.id,
			displayImage: user.displayImage ?? null,
		name: user.name,
		specialty: user.specialty,
		specialtyLabel: normalizeSpecialty(user.specialty),
		accountType: user.accountType,
		crmCrp: user.crmCrp,
		email: user.email,
		phone: user.phone,
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
		stats: {
			sessions,
			patients,
			totalSpent: Number(rentals._sum.totalPrice?.toString() ?? "0"),
		},
	};
}

export async function getProfileById(userId: string) {
	return buildProfileResponse(userId);
}

export async function updateProfileImageById(
	userId: string,
	displayImage: string | null
) {
	await prisma.user.update({
		where: { id: userId },
		data: { displayImage },
	});

	return buildProfileResponse(userId);
}

export async function updateProfileById(
	userId: string,
	data: {
		name: string;
		specialty: string;
		crmCrp: string;
		email: string;
		phone: string;
		profileImage?: string | null;
	}
) {
	const name = data.name.trim();
	const specialty = data.specialty.trim();
	const crmCrp = data.crmCrp.trim().toUpperCase();
	const email = data.email.trim().toLowerCase();
	const phone = data.phone.trim();

	if (name.length < 3) {
		throw createHttpError(400, "bad_request", "Nome invalido.");
	}
	if (!specialty) {
		throw createHttpError(400, "bad_request", "Especialidade invalida.");
	}

	if (!/^\d{5}-[A-Z]{2}$/.test(crmCrp)) {
		throw createHttpError(400, "bad_request", "Formato de CRM/CRP invalido.");
	}

	if (!email) {
		throw createHttpError(400, "bad_request", "E-mail invalido.");
	}

	if (!/^\([1-9]{2}\) [0-9]{4,5}-[0-9]{4}$/.test(phone)) {
		throw createHttpError(400, "bad_request", "Formato de telefone invalido.");
	}

	await prisma.user.update({
		where: { id: userId },
		data: {
			name,
			specialty,
			crmCrp,
			email,
			phone,
			...(data.profileImage !== undefined ? { displayImage: data.profileImage } : {}),
		},
	});

	return buildProfileResponse(userId);
}
