import { createHttpError } from "../../lib/http-error";
import bcrypt from 'bcrypt';
import { ProfileResponse } from "../../types/user/profileResponse.type";
import { StorePaymentHistory } from "../../types/user/storePaymentHistory.type";
import { UserRepository } from "./repository";
import { buildProfileMapper } from "./mapper/buildProfile.mapper";
import { UpdateProfile } from "../../types/user/updateProfile.type";

export class UserService {

	private static async buildProfileResponse(userId: string): Promise<ProfileResponse | null> {
		const user = await UserRepository.getUserInfosById(userId);
	
		if (!user) return null;
	
		const {
			rentals,
			patients,
			sessions,
		} = await UserRepository.getUserSessionsRentalsAndPatients(userId);

		return buildProfileMapper(
			user,
			sessions,
			patients,
			rentals,
		);
	}


	
	public static async getProfileById(userId: string) {
		return this.buildProfileResponse(userId);
	}
	


	public static async updateProfileImageById(
		userId: string,
		displayImage: string | null
	) {
		await UserRepository.updateProfileImageById(userId, displayImage);
	
		return this.buildProfileResponse(userId);
	}
	


	public static async storePaymentHistory(data: StorePaymentHistory) {
		return await UserRepository.storePaymentHistory(data);
	}


	
	public static async getProfessionalPaymentsHistory(id: string) {
		return await UserRepository.getProfessionalPaymentsHistory(id);
	}
	


	public static async verifyCurrentPasswordMatchById(
		professionalId  : string,
		currentPassword : string,
	): Promise<boolean> {
		const user = await UserRepository.getUserById(professionalId);
	
		if (!user) {
			throw createHttpError(401, "unauthorized", "Usuário não existe!");
		}
	
		const passwordIsValid = await bcrypt.compare(currentPassword, user.passwordHash);
		
		if (!passwordIsValid) return false; 
	
		return true;
	}
	

	
	public static async changeProfessionalPasswordById(
		professionalId : string,
		newPassword    : string,
	) {
		const user = await UserRepository.getUserById(professionalId);
	
		if (!user) {
			throw createHttpError(401, "unauthorized", "Usuário não existe!");
		}
	
		const hashedPassword = await bcrypt.hash(newPassword, 10);
	
		return await UserRepository.changeProfessionalPasswordById(
			professionalId,
			hashedPassword,
		);
	}
	


	public static async updateProfileById(
		userId : string,
		data   : UpdateProfile
	) {
		const name = data.name.trim();
		const specialty = data.specialty.trim();
		const crmCrp = data.crmCrp.trim().toUpperCase();
		const email = data.email.trim().toLowerCase();
		const phone = data.phone.trim();
	
		if (name.length < 3) {
			throw createHttpError(400, "bad_request", "Nome invalido.");
		} if (!specialty) {
			throw createHttpError(400, "bad_request", "Especialidade invalida.");
		} if (!/^\d{5}-[A-Z]{2}$/.test(crmCrp)) {
			throw createHttpError(400, "bad_request", "Formato de CRM/CRP invalido.");
		} if (!email) {
			throw createHttpError(400, "bad_request", "E-mail invalido.");
		} if (!/^\([1-9]{2}\) [0-9]{4,5}-[0-9]{4}$/.test(phone) && phone) {
			throw createHttpError(400, "bad_request", "Formato de telefone invalido.");
		}
	
		await UserRepository.updateProfileById(
			userId,
			name,
			specialty,
			crmCrp,
			email,
			phone,
			data
		);
	
		return this.buildProfileResponse(userId);
	}
}

