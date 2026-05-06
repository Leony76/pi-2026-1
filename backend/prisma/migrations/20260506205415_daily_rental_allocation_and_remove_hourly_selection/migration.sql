/*
  Warnings:

  - The values [PER_HOUR] on the enum `AllocationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `selectedHours` on the `RoomRental` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AllocationType_new" AS ENUM ('DAILY', 'WEEK', 'MONTH');
ALTER TABLE "RoomRental" ALTER COLUMN "allocationType" TYPE "AllocationType_new" USING ("allocationType"::text::"AllocationType_new");
ALTER TYPE "AllocationType" RENAME TO "AllocationType_old";
ALTER TYPE "AllocationType_new" RENAME TO "AllocationType";
DROP TYPE "public"."AllocationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "RoomRental" DROP COLUMN "selectedHours";
