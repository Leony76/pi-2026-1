"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = meController;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const service_1 = require("./service");
function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function getTokenFromHeader(authHeader) {
    if (!authHeader) {
        throw createHttpError(401, "Authorization header is required");
    }
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        throw createHttpError(401, "Invalid authorization header");
    }
    return token;
}
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw createHttpError(500, "JWT_SECRET not configured");
    }
    return secret;
}
async function meController(request, response, next) {
    try {
        const token = getTokenFromHeader(request.headers.authorization);
        const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
        const user = await (0, service_1.getProfileById)(payload.sub);
        if (!user) {
            throw createHttpError(404, "User not found");
        }
        response.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map