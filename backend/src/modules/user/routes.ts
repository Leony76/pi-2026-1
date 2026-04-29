import { Router } from "express";

import { meController, updateMeController } from "./controller";

const userRoutes = Router();

userRoutes.get("/me", meController);
userRoutes.put("/me", updateMeController);
userRoutes.patch("/me", updateMeController);

export default userRoutes;
