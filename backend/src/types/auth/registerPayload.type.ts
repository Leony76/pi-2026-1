export type RegisterPayload = {
  name: string;
  specialty: string;
  crmCrp: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt: Date | null;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date | null;
  emailVerificationTokenHash: string;
  emailVerificationTokenExpiresAt: Date | null;
}