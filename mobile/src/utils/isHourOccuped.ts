import { HourShift } from "@/types/room/hourShift.type";

export const isHourOccupied = (
  occupedHoursList : HourShift[],
  start : string, 
  end   : string
) => {
  return occupedHoursList.some((occupied) => occupied.startHour === start && occupied.endHour === end);
};