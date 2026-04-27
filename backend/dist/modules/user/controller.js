"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = meController;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const service_1 = require("./service");
const auth_response_1 = require("../../lib/auth-response");
const http_error_1 = require("../../lib/http-error");
function getTokenFromHeader(authHeader) {
    if (!authHeader) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Cabeçalho de autorização é requerível!");
    }
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        throw (0, http_error_1.createHttpError)(401, "unauthorized", "Cabeçalho de autorização inválido!");
    }
    return token;
}
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw (0, http_error_1.createHttpError)(500, "internal_server_error", "JWT_SECRET não configurado!");
    }
    return secret;
}
async function meController(request, response, next) {
    try {
        const token = getTokenFromHeader(request.headers.authorization);
        const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
        const user = await (0, service_1.getProfileById)(payload.sub);
        if (!user) {
            throw (0, http_error_1.createHttpError)(404, "not_found", "Usuário não encontrado!");
        }
        (0, auth_response_1.sendSuccessResponse)(response, 200, user);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map