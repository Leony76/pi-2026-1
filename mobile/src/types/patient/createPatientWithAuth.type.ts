export type CreatePatient = {
  name: string;
  phone: string;
  email?: string;
  initialDate: string;
  initialHour: string;
  observations?: string;
}