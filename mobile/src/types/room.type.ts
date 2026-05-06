export type Room = {
  readonly id  : number | string;
  isAvailable  : boolean;
  displayImage : string | null;
  title        : string;
  complementaryData : {
    floor      : string;
    area       : number;
    additional : string; 
  };
  prices : {
    perHour : number;
    _week : number;
    month   : number;
  }
};

export type RoomDisplayCard = Room;