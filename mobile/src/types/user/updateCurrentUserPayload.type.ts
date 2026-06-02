export type UpdateCurrentUserPayload = {
  name: string;
  specialty: string;
  crmCrp: string;
  email: string;
  phone: string;
  profileImage?: string | null;
};