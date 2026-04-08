"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileById = getProfileById;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const specialty_1 = require("../shared/specialty");
async function getProfileById(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            specialty: true,
            crmCrp: true,
            email: true,
            emailVerifiedAt: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        return null;
    }
    return {
        ...user,
        specialty: (0, specialty_1.normalizeSpecialty)(user.specialty),
    };
}
//# sourceMappingURL=service.js.map