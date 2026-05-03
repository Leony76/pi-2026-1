import { Router } from "express";

import { meController, updateMeController, updateMeImageController } from "./controller";

const userRoutes = Router();

userRoutes.get("/me", meController);
userRoutes.put("/me", updateMeController);
userRoutes.patch("/me", updateMeController);
userRoutes.patch("/me/image", updateMeImageController);

export default userRoutes;
