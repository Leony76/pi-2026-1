export type EntryExitToday = {
  occupantName : string;
  room         : string;
  entry        : string
  exit         : string;
  sessions     : number;
  totalValue   : 'MONTHLY' | 'DAILY' | 'WEEKLY';
};