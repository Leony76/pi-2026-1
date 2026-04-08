import prisma from "../../lib/prisma";

export async function getProfileById(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			specialty: true,
			crmCrp: true,
			email: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}
