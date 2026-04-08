import prisma from "../../lib/prisma";
import { normalizeSpecialty } from "../shared/specialty";

export async function getProfileById(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			specialty: true,
			crmCrp: true,
			email: true,
			emailVerifiedAt: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) {
		return null;
	}

	return {
		...user,
		specialty: normalizeSpecialty(user.specialty),
	};
}
