export type ActiveRental = {
  roomId: string;
  professional: {
    name: string;
    specialty: string;
  };
  room: {
    title: string;
  };
  endDate: Date;
  startDate: Date;
}