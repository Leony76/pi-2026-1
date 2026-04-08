"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileById = getProfileById;
const prisma_1 = __importDefault(require("../../lib/prisma"));
async function getProfileById(userId) {
    return prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            specialty: true,
            crmCrp: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}
//# sourceMappingURL=service.js.map