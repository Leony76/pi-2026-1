export type AuthUser = {
  id: string;
  name: string;
  specialty: string;
  accountType: 'PROFESSIONAL' | 'ENTERPRISE';
  crmCrp: string;
  email: string;
  createdAt: string;
};
