-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "passwordResetAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passwordResetSessionTokenHash" TEXT,
ADD COLUMN     "passwordResetSessionExpiresAt" TIMESTAMP(3);