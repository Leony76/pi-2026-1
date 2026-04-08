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
type SafeUser = {
    id: string;
    name: string;
    specialty: string;
    crmCrp: string;
    email: string;
    createdAt: Date;
};
type AuthResponse = {
    user: SafeUser;
    token: string;
};
export declare function register(data: RegisterInput): Promise<AuthResponse>;
export declare function login(data: LoginInput): Promise<AuthResponse>;
export {};
//# sourceMappingURL=service.d.ts.map