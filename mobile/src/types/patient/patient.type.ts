export type Patient = {
  readonly id : string;
  name        : string;
  status      : 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  nextSession: {
    startHour: string;
    endHour: string;
  }
};

export type PatientInfos = Pick<Patient, 'id' | 'name' | 'status'> & {
  phone     : string;
  createdAt : string;
  sessionHistory : {
    totalMade : number;
    session: {
      lastOneDate    : string;
      valueByEach    : number;
      totalGenerated : number;
    };
  };
  sessions : {
    date : string;
    room : string;
    hour : {
      start : string;
      end   : string;
    };
  }[];
};