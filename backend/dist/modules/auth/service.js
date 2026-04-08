"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function toSafeUser(user) {
    return {
        id: user.id,
        name: user.name,
        specialty: user.specialty,
        crmCrp: user.crmCrp,
        email: user.email,
        createdAt: user.createdAt,
    };
}
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw createHttpError(500, "JWT_SECRET not configured");
    }
    return secret;
}
async function register(data) {
    const name = data.name?.trim();
    const specialty = data.specialty?.trim();
    const crmCrp = data.crmCrp?.trim().toUpperCase();
    const email = data.email?.trim().toLowerCase();
    if (!name || !specialty || !crmCrp || !email || !data.password || !data.repeatPassword) {
        throw createHttpError(400, "Missing required fields");
    }
    if (data.password !== data.repeatPassword) {
        throw createHttpError(400, "Passwords do not match");
    }
    const existingUser = await prisma_1.default.user.findFirst({
        where: {
            OR: [{ email }, { crmCrp }],
        },
    });
    if (existingUser) {
        throw createHttpError(409, "User with this e-mail or CRM/CRP already exists");
    }
    const passwordHash = await bcrypt_1.default.hash(data.password, 10);
    const user = await prisma_1.default.user.create({
        data: {
            name,
            specialty,
            crmCrp,
            email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            specialty: true,
            crmCrp: true,
            email: true,
            createdAt: true,
        },
    });
    const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: "7d" });
    return { user: toSafeUser(user), token };
}
async function login(data) {
    const email = data.email?.trim().toLowerCase();
    if (!email || !data.password) {
        throw createHttpError(400, "Missing e-mail or password");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw createHttpError(401, "Invalid credentials");
    }
    const passwordIsValid = await bcrypt_1.default.compare(data.password, user.passwordHash);
    if (!passwordIsValid) {
        throw createHttpError(401, "Invalid credentials");
    }
    const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: "7d" });
    return {
        user: toSafeUser(user),
        token,
    };
}
//# sourceMappingURL=service.js.map