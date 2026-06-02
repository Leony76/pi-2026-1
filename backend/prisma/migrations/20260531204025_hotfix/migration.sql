/*
  Warnings:

  - A unique constraint covering the columns `[roomId,name]` on the table `RoomCustomItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "price" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RoomCustomItem_roomId_name_key" ON "RoomCustomItem"("roomId", "name");
