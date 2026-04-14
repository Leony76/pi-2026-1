import { Room } from "./room.type";

export type RoomOccupation = Pick<Room, 'id' | 'isAvailable' | 'title'> & {
  occupant: string | null;
  occupation: {
    startTime : string | null;
    endTime   : string | null;
  };
};