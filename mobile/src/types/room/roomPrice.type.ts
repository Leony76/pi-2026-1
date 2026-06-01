export type RoomPrice = {
  readonly id : string;
  room : string;
  price: {
    byHour  : number;
    _week : number; 
    byMonth : number; 
  };  
};