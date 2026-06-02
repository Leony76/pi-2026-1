-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "emailVerificationTokenHash" TEXT,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetTokenHash" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "refreshTokenHash" TEXT;
