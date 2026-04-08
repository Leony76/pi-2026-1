import { Router } from "express";

import { meController } from "./controller";

const userRoutes = Router();

userRoutes.get("/me", meController);

export default userRoutes;
