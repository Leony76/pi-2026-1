import { RegisterInput } from "../../types/auth/registerInput.type";
import { AuthResponse } from "../../types/auth/authResponse.type";
import { EmailVerificationRequestInput } from "../../types/auth/emailVerificationRequestInput.type";
import { LoginInput } from "../../types/auth/loginInput.type";
import { LogoutInput } from "../../types/auth/logoutInput.type";
import { PasswordResetInput } from "../../types/auth/passwordResetInput.type";
import { PasswordResetRequestInput } from "../../types/auth/passwordResetRequestInput.type";
import { RefreshInput } from "../../types/auth/refreshInput.type";
import { VerifyEmailInput } from "../../types/auth/verifyEmailInput.type";
import { VerifyResetCodeInput } from "../../types/auth/verifyResetCodeInput.type";
export declare class AuthService {
    static register(data: RegisterInput): Promise<AuthResponse>;
    static login(data: LoginInput): Promise<AuthResponse>;
    static refreshSession(data: RefreshInput): Promise<AuthResponse>;
    static logout(data: LogoutInput): Promise<{
        message: string;
    }>;
    static requestEmailVerification(data: EmailVerificationRequestInput): Promise<{
        message: string;
        verificationToken: string;
    }>;
    static verifyEmail(data: VerifyEmailInput): Promise<{
        message: string;
    }>;
    static requestPasswordReset(data: PasswordResetRequestInput): Promise<{
        message: string;
    }>;
    static verifyResetCode(data: VerifyResetCodeInput): Promise<{
        message: string;
        sessionToken: string;
    }>;
    static resetPassword(data: PasswordResetInput): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=service.d.ts.map