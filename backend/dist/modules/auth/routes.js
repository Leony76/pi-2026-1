"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const authRoutes = (0, express_1.Router)();
authRoutes.post("/register", controller_1.registerController);
authRoutes.post("/login", controller_1.loginController);
exports.default = authRoutes;
//# sourceMappingURL=routes.js.map