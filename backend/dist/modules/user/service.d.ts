type ProfileStats = {
    sessions: number;
    patients: number;
    totalSpent: number;
};
export type ProfileResponse = {
    id: string;
    name: string;
    specialty: string;
    specialtyLabel: string;
    crmCrp: string;
    email: string;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
    stats: ProfileStats;
};
export declare function getProfileById(userId: string): Promise<ProfileResponse | null>;
export declare function updateProfileById(userId: string, data: {
    name: string;
    specialty: string;
    crmCrp: string;
    email: string;
    phone: string;
}): Promise<ProfileResponse | null>;
export {};
//# sourceMappingURL=service.d.ts.map