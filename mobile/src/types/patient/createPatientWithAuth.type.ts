export type CreatePatient = {
  professionalId: string;
  name: string;
  phone: string;
  email?: string;
  startHour: Date;
  endHour: Date;
  observations?: string;
}