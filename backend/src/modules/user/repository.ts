import bcrypt from 'bcrypt';
import prisma from "../../lib/prisma";
import { createHttpError } from "../../lib/http-error";
import { StorePaymentHistory } from "../../types/user/storePaymentHistory.type";
import { UpdateProfile } from '../../types/user/updateProfile.type';

export class UserRepository {

  public static async getUserSessionsRentalsAndPatients(userId: string) {
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
      sessions,
      patients,
      rentals,
    }
  }

	public static async getUserInfosById(userId: string) {
		return await prisma.user.findUnique({
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
	}
	
	public static async updateProfileImageById(
		userId: string,
		displayImage: string | null
	) {
		return await prisma.user.update({
			where: { id: userId },
			data: { displayImage },
		});
	}
	
	public static async storePaymentHistory(data: StorePaymentHistory) {
		return await prisma.paymentHistory.create({
			data: {
				from: data.from,
				paid: data.paid,
				paymentMethod: data.paymentMethod,
				professionalId: data.professionalId,
			}
		});
	}
	
	public static async getProfessionalPaymentsHistory(
		id: string,
	) {
		return await prisma.paymentHistory.findMany({
			where: { professionalId: id },
			omit: {
				updatedAt: true,
			}
		});
	}



  public static async getUserById(id: string) {
    return await prisma.user.findUnique({
			where: { id },
		})
  }


	
	public static async verifyCurrentPasswordMatchById(
		professionalId  : string,
		currentPassword : string,
	): Promise<boolean> {
		const user = await prisma.user.findUnique({
			where: { id: professionalId },
		});
	
		if (!user) {
			throw createHttpError(401, "unauthorized", "Usuário não existe!");
		}
	
		const passwordIsValid = await bcrypt.compare(currentPassword, user.passwordHash);
		
		if (!passwordIsValid) {
			return false;
		} 
	
		return true;
	}
	
	public static async changeProfessionalPasswordById(
		professionalId : string,
    hashedPassword : string,
	) {
		return await prisma.user.update({
			where: { id: professionalId },
			data: {
				passwordHash: hashedPassword,
			},
		});
	}
	
	public static async updateProfileById(
		userId: string,
		name: string,
    specialty: string,
    crmCrp: string,
    email: string,
    phone: string,
    data: UpdateProfile,
	) {
		return prisma.user.update({
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
	}
}

