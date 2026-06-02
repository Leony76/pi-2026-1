export type CreatePatientInput = {
  professionalId: string;
  name: string;
  phone: string;
  email?: string | null;
  startHour: Date;
  endHour: Date;
  observations?: string | null;
};