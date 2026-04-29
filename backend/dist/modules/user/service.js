"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileById = getProfileById;
exports.updateProfileById = updateProfileById;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const http_error_1 = require("../../lib/http-error");
const specialty_1 = require("../shared/specialty");
async function buildProfileResponse(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            specialty: true,
            crmCrp: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        return null;
    }
    const [sessions, patients, rentals] = await Promise.all([
        prisma_1.default.session.count({
            where: { professionalId: userId },
        }),
        prisma_1.default.patient.count({
            where: { professionalId: userId },
        }),
        prisma_1.default.roomRental.aggregate({
            where: { professionalId: userId },
            _sum: {
                totalPrice: true,
            },
        }),
    ]);
    return {
        id: user.id,
        name: user.name,
        specialty: user.specialty,
        specialtyLabel: (0, specialty_1.normalizeSpecialty)(user.specialty),
        crmCrp: user.crmCrp,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        stats: {
            sessions,
            patients,
            totalSpent: Number(rentals._sum.totalPrice?.toString() ?? "0"),
        },
    };
}
async function getProfileById(userId) {
    return buildProfileResponse(userId);
}
async function updateProfileById(userId, data) {
    const name = data.name.trim();
    const specialty = data.specialty.trim();
    const crmCrp = data.crmCrp.trim().toUpperCase();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();
    if (name.length < 3) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Nome invalido.");
    }
    if (!specialty) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Especialidade invalida.");
    }
    if (!/^\d{5}-[A-Z]{2}$/.test(crmCrp)) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Formato de CRM/CRP invalido.");
    }
    if (!email) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "E-mail invalido.");
    }
    if (!/^\([1-9]{2}\) 9?[0-9]{5}-[0-9]{4}$/.test(phone)) {
        throw (0, http_error_1.createHttpError)(400, "bad_request", "Formato de telefone invalido.");
    }
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            name,
            specialty,
            crmCrp,
            email,
            phone,
        },
    });
    return buildProfileResponse(userId);
}
//# sourceMappingURL=service.js.map