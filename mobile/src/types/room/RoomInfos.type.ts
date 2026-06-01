import { NewRoomFormData } from "@/schemas/newRoom.schema";

export type RoomInfos = NewRoomFormData & {
  image: string | null;
  customItems: string[];
};