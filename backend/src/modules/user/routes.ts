import { Router } from "express";
import { changeProfessionalPasswordController, getProfessionalPaymentHistoryController, meController, storePaymentToPaymentHistoryController, updateMeController, updateMeImageController, verifyCurrentPasswordMatchController } from "./controller";

const userRoutes = Router();

userRoutes.get("/me", meController);
userRoutes.put("/me", updateMeController);
userRoutes.patch("/me", updateMeController);
userRoutes.post("/:professionalId/verifyCurrentPasswordMatch", verifyCurrentPasswordMatchController);
userRoutes.post("/:professionalId/changePassword", changeProfessionalPasswordController);
userRoutes.patch("/me/image", updateMeImageController);
userRoutes.post("/payments/storage", storePaymentToPaymentHistoryController);
userRoutes.get("/payments/:professionalId", getProfessionalPaymentHistoryController);


export default userRoutes;
