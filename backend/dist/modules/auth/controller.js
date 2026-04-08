"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
const service_1 = require("./service");
async function registerController(request, response, next) {
    try {
        const result = await (0, service_1.register)(request.body);
        response.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function loginController(request, response, next) {
    try {
        const result = await (0, service_1.login)(request.body);
        response.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map