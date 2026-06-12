import { ProfileResponse } from "../../types/user/profileResponse.type";
import { StorePaymentHistory } from "../../types/user/storePaymentHistory.type";
import { UpdateProfile } from "../../types/user/updateProfile.type";
export declare class UserService {
    private static buildProfileResponse;
    static getProfileById(userId: string): Promise<ProfileResponse | null>;
    static updateProfileImageById(userId: string, displayImage: string | null): Promise<ProfileResponse | null>;
    static storePaymentHistory(data: StorePaymentHistory): Promise<{
        from: import("@prisma/client").$Enums.PaymentFrom;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        professionalId: string;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        paid: import("@prisma/client/runtime/library").Decimal;
    }>;
    static getProfessionalPaymentsHistory(id: string): Promise<{
        from: import("@prisma/client").$Enums.PaymentFrom;
        id: string;
        createdAt: Date;
        professionalId: string;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        paid: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    static verifyCurrentPasswordMatchById(professionalId: string, currentPassword: string): Promise<boolean>;
    static changeProfessionalPasswordById(professionalId: string, newPassword: string): Promise<{
        name: string;
        id: string;
        specialty: string;
        accountType: import("@prisma/client").$Enums.AccountType;
        crmCrp: string;
        email: string;
        phone: string | null;
        displayImage: string | null;
        passwordHash: string;
        emailVerifiedAt: Date | null;
        emailVerificationTokenHash: string | null;
        emailVerificationTokenExpiresAt: Date | null;
        passwordResetTokenHash: string | null;
        passwordResetTokenExpiresAt: Date | null;
        passwordResetAttempts: number;
        passwordResetSessionTokenHash: string | null;
        passwordResetSessionExpiresAt: Date | null;
        refreshTokenHash: string | null;
        refreshTokenExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static updateProfileById(userId: string, data: UpdateProfile): Promise<ProfileResponse | null>;
}
//# sourceMappingURL=service.d.ts.map