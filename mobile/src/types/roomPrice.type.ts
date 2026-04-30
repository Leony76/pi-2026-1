export type RoomPrice = {
  readonly id : string;
  room : string;
  price: {
    byHour  : number;
    _3xWeek : number; 
    byMonth : number; 
  };  
};