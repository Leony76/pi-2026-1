export type CurrentUserResponse = {
  id: string;
  name: string;
  specialty: string;
  specialtyLabel: string;
  accountType: 'PROFESSIONAL' | 'ENTERPRISE';
  crmCrp: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  displayImage: string | null;
  stats: {
    sessions: number;
    patients: number;
    totalSpent: number;
  };
};