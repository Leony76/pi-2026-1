import { Prisma } from "@prisma/client";

export type ExpansesSummary = Prisma.GetExpenseAggregateType<{
    where: {
        date: {
            gte: Date;
            lt: Date;
        };
    };
    _sum: {
        maintenance: true;
        electricalEnergy: true;
        cleaning: true;
        totalValue: true;
    };
}>