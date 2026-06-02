export type UpdateProfile = {
  name: string;
  specialty: string;
  crmCrp: string;
  email: string;
  phone: string;
  profileImage?: string | null;
}