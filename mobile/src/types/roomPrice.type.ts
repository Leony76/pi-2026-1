export type RoomPrice = {
  readonly id : number;
  room : string;
  price: {
    byHour  : number;
    _3xWeek : number; 
    byMonth : number; 
  };  
};