export type RoomRevenue = {
  readonly id : number;
  room : string;
  totalRevenue : number;
  revenue?: {
    byHour  : number;
    _3xWeek : number;
    byMonth : number;
  };
};

export type OverallRoomRevenue = {
  roomsRevenue : RoomRevenue[];
  totalRevenue : number;
}