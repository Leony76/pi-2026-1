-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "Floor" AS ENUM ('GROUND_FLOOR', 'FIRST_FLOOR', 'SECOND_FLOOR', 'THIRD_FLOOR', 'FOURTH_FLOOR', 'FIFTH_FLOOR');

-- CreateEnum
CREATE TYPE "RoomCharacteristic" AS ENUM ('AIR_CONDITIONER', 'SOUNDPROOFED', 'AIR_CONDITIONER_PLUS_SOUNDPROOFED', 'DEFAULT');

-- CreateEnum
CREATE TYPE "RoomItemName" AS ENUM ('SOFA_DIVA', 'CADEIRA', 'COMPUTADOR', 'MACA', 'ARMARIO', 'BANHEIRO', 'AR_CONDI', 'TV_MONITOR', 'EQUIP_MEDICO', 'ESPELHO', 'PLANTAS', 'ILUMI_ESPECIAL');

-- CreateEnum
CREATE TYPE "AllocationType" AS ENUM ('PER_HOUR', 'WEEK', 'MONTH');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'BANK_SLIP', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "EntryExitBillingType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "initialDate" TIMESTAMP(3) NOT NULL,
    "observations" TEXT,
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextSessionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "enterpriseOwnerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayImage" TEXT,
    "floor" "Floor" NOT NULL,
    "area" DECIMAL(5,2) NOT NULL,
    "characteristic" "RoomCharacteristic" NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomPrice" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "price3xWeek" DECIMAL(10,2) NOT NULL,
    "pricePerMonth" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomItem" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" "RoomItemName" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomRental" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "allocationType" "AllocationType" NOT NULL,
    "paymentMethod" "PaymentMethod",
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "selectedHours" JSONB,
    "selectedWeekDay" "WeekDay"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomRental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryExit" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL,
    "exitedAt" TIMESTAMP(3),
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "billingType" "EntryExitBillingType" NOT NULL,
    "totalValue" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntryExit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomRevenue" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "revenuePerHour" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "revenue3xWeek" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "revenueMonthly" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomRevenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "enterpriseOwnerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "maintenance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "electricalEnergy" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cleaning" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Patient_professionalId_idx" ON "Patient"("professionalId");

-- CreateIndex
CREATE INDEX "Patient_status_idx" ON "Patient"("status");

-- CreateIndex
CREATE INDEX "Room_enterpriseOwnerId_idx" ON "Room"("enterpriseOwnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_enterpriseOwnerId_title_key" ON "Room"("enterpriseOwnerId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "RoomPrice_roomId_key" ON "RoomPrice"("roomId");

-- CreateIndex
CREATE INDEX "RoomItem_roomId_idx" ON "RoomItem"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomItem_roomId_name_key" ON "RoomItem"("roomId", "name");

-- CreateIndex
CREATE INDEX "RoomRental_professionalId_idx" ON "RoomRental"("professionalId");

-- CreateIndex
CREATE INDEX "RoomRental_roomId_idx" ON "RoomRental"("roomId");

-- CreateIndex
CREATE INDEX "Session_patientId_idx" ON "Session"("patientId");

-- CreateIndex
CREATE INDEX "Session_professionalId_idx" ON "Session"("professionalId");

-- CreateIndex
CREATE INDEX "Session_roomId_idx" ON "Session"("roomId");

-- CreateIndex
CREATE INDEX "EntryExit_professionalId_idx" ON "EntryExit"("professionalId");

-- CreateIndex
CREATE INDEX "EntryExit_roomId_idx" ON "EntryExit"("roomId");

-- CreateIndex
CREATE INDEX "EntryExit_enteredAt_idx" ON "EntryExit"("enteredAt");

-- CreateIndex
CREATE INDEX "RoomRevenue_year_month_idx" ON "RoomRevenue"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "RoomRevenue_roomId_month_year_key" ON "RoomRevenue"("roomId", "month", "year");

-- CreateIndex
CREATE INDEX "Expense_enterpriseOwnerId_idx" ON "Expense"("enterpriseOwnerId");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "User_refresh_token_lookup_idx" ON "User"("refreshTokenHash", "refreshTokenExpiresAt");

-- CreateIndex
CREATE INDEX "User_email_verification_lookup_idx" ON "User"("emailVerificationTokenHash", "emailVerificationTokenExpiresAt");

-- CreateIndex
CREATE INDEX "User_password_reset_lookup_idx" ON "User"("passwordResetTokenHash", "passwordResetTokenExpiresAt");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_enterpriseOwnerId_fkey" FOREIGN KEY ("enterpriseOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomPrice" ADD CONSTRAINT "RoomPrice_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomItem" ADD CONSTRAINT "RoomItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRental" ADD CONSTRAINT "RoomRental_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRental" ADD CONSTRAINT "RoomRental_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryExit" ADD CONSTRAINT "EntryExit_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryExit" ADD CONSTRAINT "EntryExit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRevenue" ADD CONSTRAINT "RoomRevenue_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_enterpriseOwnerId_fkey" FOREIGN KEY ("enterpriseOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
