-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'PROFESSIONAL';

-- CreateIndex
CREATE INDEX "User_password_reset_session_lookup_idx" ON "User"("passwordResetSessionTokenHash", "passwordResetSessionExpiresAt");
