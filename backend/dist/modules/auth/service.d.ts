type RegisterInput = {
    name: string;
    specialty: string;
    crmCrp: string;
    email: string;
    password: string;
    repeatPassword: string;
};
type LoginInput = {
    email: string;
    password: string;
};
type RefreshInput = {
    refreshToken: string;
};
type EmailVerificationRequestInput = {
    email: string;
};
type VerifyEmailInput = {
    token: string;
};
type PasswordResetRequestInput = {
    email: string;
};
type PasswordResetInput = {
    token: string;
    password: string;
    repeatPassword: string;
};
type LogoutInput = {
    refreshToken: string;
};
type SafeUser = {
    id: string;
    name: string;
    specialty: string;
    crmCrp: string;
    email: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
};
type AuthResponse = {
    user: SafeUser;
    token: string;
    accessToken: string;
    refreshToken: string;
    emailVerificationToken?: string;
};
export declare function register(data: RegisterInput): Promise<AuthResponse>;
export declare function login(data: LoginInput): Promise<AuthResponse>;
export declare function refreshSession(data: RefreshInput): Promise<AuthResponse>;
export declare function logout(data: LogoutInput): Promise<{
    message: string;
}>;
export declare function requestEmailVerification(data: EmailVerificationRequestInput): Promise<{
    message: string;
    verificationToken: string;
}>;
export declare function verifyEmail(data: VerifyEmailInput): Promise<{
    message: string;
}>;
export declare function requestPasswordReset(data: PasswordResetRequestInput): Promise<{
    message: string;
    resetToken: string;
}>;
export declare function resetPassword(data: PasswordResetInput): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map