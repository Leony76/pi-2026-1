import { CreateRoomInput } from "./createRoom.type";

export type UpdateRoom = CreateRoomInput & {
	id: string;
};