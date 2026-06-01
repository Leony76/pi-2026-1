export type RoomRevenue = {
  readonly id : string;
  room : string;
  totalRevenue : number;
  revenue?: {
    byHour  : number;
    _week : number;
    byMonth : number;
  };
};

export type OverallRoomRevenue = {
  roomsRevenue : RoomRevenue[];
  totalRevenue : number;
}