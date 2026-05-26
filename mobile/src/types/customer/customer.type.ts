import { Specialty } from "@/constants/maps/selectOptions.map";

export type Customer = {
  readonly id   : string;
  name          : string;
  specialty     : Specialty;
  occupiedRoom : string | null;
  occupation: {
    startHour : string | null;
    endHour   : string | null;
    limitDate : string | null;
  }
}

export type CustomerHistory = Omit<Customer, 'occupation'> & {
  unoccupiedRoomAt: string;
};