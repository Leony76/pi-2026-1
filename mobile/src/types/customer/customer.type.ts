import { Specialty } from "@/constants/maps/selectOptions.map";
import { Allocation } from "../room/allocation.type";

export type Customer = {
  readonly id   : string;
  name          : string;
  specialty     : Specialty;
  allocationType: Allocation;
  occupiedRoom : string | null;
  occupation: {
    startHour : string | null;
    endHour   : string | null;
    limitDate : string | null;
  }
}

export type CustomerHistory = Omit<Customer, 'occupation'> & {
  unoccupiedRoomAt: string;
  startDate : string;
  endDate   : string;
};