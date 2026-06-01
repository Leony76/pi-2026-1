export type RoomRental = {
  id: string;
  roomTitle: string;
  roomFloor: string;
  roomCharacteristic: string;
  allocationType: "DAILY" | "WEEK" | "MONTH";
  startDate: string;
  endDate: string;
  totalPrice: number;
  selectedWeekDays: string[];
  isActive: boolean;
  selectedHours?: { 
    startHour: string; 
    endHour: string 
  } | null;
};