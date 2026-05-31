import { Router } from "express";
import { UserController } from "./controller";

const userRoutes = Router();

userRoutes.get("/me"                                          , UserController.me);
userRoutes.put("/me"                                          , UserController.updateMe);
userRoutes.patch("/me"                                        , UserController.updateMe);
userRoutes.post("/:professionalId/verifyCurrentPasswordMatch" , UserController.verifyCurrentPasswordMatch);
userRoutes.post("/:professionalId/changePassword"             , UserController.changeProfessionalPassword);
userRoutes.patch("/me/image"                                  , UserController.updateMeImage);
userRoutes.post("/payments/storage"                           , UserController.storePaymentToPaymentHistory);
userRoutes.get("/payments/:professionalId"                    , UserController.getProfessionalPaymentHistory);


export default userRoutes;
