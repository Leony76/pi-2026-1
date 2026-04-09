export type Room = {
  readonly id  : number | string;
  isAvailable  : boolean;
  displayImage : string | null;
  title        : string;
  subtitle     : string;
  prices : {
    perHour : number;
    _3xWeek : number;
    month   : number;
  }
};

export type RoomDisplayCard = Room;