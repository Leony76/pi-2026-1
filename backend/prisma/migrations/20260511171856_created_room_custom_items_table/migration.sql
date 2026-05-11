-- CreateTable
CREATE TABLE "RoomCustomItem" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomCustomItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomCustomItem" ADD CONSTRAINT "RoomCustomItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
