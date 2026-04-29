import { Router } from "express";

import { enterpriseDashboardController, listRoomsController, createRentalController, getUserRentalsController, roomOccupancyController } from "./controller";

const roomRoutes = Router();

roomRoutes.get("/", listRoomsController);
roomRoutes.get("/dashboard", enterpriseDashboardController);
roomRoutes.get("/:roomId/occupancy", roomOccupancyController);
roomRoutes.post("/rentals", createRentalController);
roomRoutes.get("/rentals/me", getUserRentalsController);

export default roomRoutes;
