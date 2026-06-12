"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const userRoutes = (0, express_1.Router)();
userRoutes.get("/me", controller_1.UserController.me);
userRoutes.put("/me", controller_1.UserController.updateMe);
userRoutes.patch("/me", controller_1.UserController.updateMe);
userRoutes.post("/:professionalId/verifyCurrentPasswordMatch", controller_1.UserController.verifyCurrentPasswordMatch);
userRoutes.post("/:professionalId/changePassword", controller_1.UserController.changeProfessionalPassword);
userRoutes.patch("/me/image", controller_1.UserController.updateMeImage);
userRoutes.post("/payments/storage", controller_1.UserController.storePaymentToPaymentHistory);
userRoutes.get("/payments/:professionalId", controller_1.UserController.getProfessionalPaymentHistory);
exports.default = userRoutes;
//# sourceMappingURL=routes.js.map