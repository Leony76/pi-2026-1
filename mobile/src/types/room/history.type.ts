export type History = {
  readonly id : string;
  patientName : string;
  status      : 'CLOSED';
  lastSession: {
    startHour : string,
    endHour   : string,
  }
};