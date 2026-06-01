import { Specialty } from "@/constants/maps/selectOptions.map";
import { Allocation } from "./allocation.type";
import { Room } from "./room.type";

export type RoomOccupation = Pick<Room, 
  'id' | 'isAvailable' | 'title'> & {
  occupants: {
    professionalId : string;
    name           : string;
    specialty    : Specialty;
    allocations  : {
      type      : Allocation;
      startDate : string;
      endDate   : string;
    }[];
  }[];
};