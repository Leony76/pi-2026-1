import { REFRESH_TOKEN_TTL_DAYS, EMAIL_VERIFICATION_TOKEN_TTL_DAYS } from "../../../consts/auth/service.consts"
import { hashToken } from "../../../lib/token"
import { addDays } from "../../../utils/addDays.util"

export const registerPayloadMapper = (
  name: string,
  normalizedSpecialty: string,
  normalizedCrmCrp: string,
  normalizedEmail: string,
  passwordHash: string,
  emailVerificationToken: string,
  refreshToken: string
) => {
  return {
    name,
    specialty: normalizedSpecialty,
    crmCrp: normalizedCrmCrp,
    email: normalizedEmail,
    passwordHash,
    emailVerifiedAt: null,
    refreshTokenHash: hashToken(refreshToken),
    refreshTokenExpiresAt: addDays(new Date(), REFRESH_TOKEN_TTL_DAYS),
    emailVerificationTokenHash: hashToken(emailVerificationToken),
    emailVerificationTokenExpiresAt: addDays(new Date(), EMAIL_VERIFICATION_TOKEN_TTL_DAYS),
  }
}