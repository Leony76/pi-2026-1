"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const userRoutes = (0, express_1.Router)();
userRoutes.get("/me", controller_1.meController);
userRoutes.put("/me", controller_1.updateMeController);
userRoutes.patch("/me", controller_1.updateMeController);
exports.default = userRoutes;
//# sourceMappingURL=routes.js.map