import { Router } from "express";

import { listRoomsController, createRentalController, getUserRentalsController } from "./controller";

const roomRoutes = Router();

roomRoutes.get("/", listRoomsController);
roomRoutes.post("/rentals", createRentalController);
roomRoutes.get("/rentals/me", getUserRentalsController);

export default roomRoutes;
