import { Router } from "express";

import { enterpriseDashboardController, enterpriseValuesController, listRoomsController, createRentalController, getUserRentalsController, roomOccupancyController, createRoomController } from "./controller";

const roomRoutes = Router();

roomRoutes.get("/", listRoomsController);
roomRoutes.post("/", createRoomController);
roomRoutes.get("/dashboard", enterpriseDashboardController);
roomRoutes.get("/values", enterpriseValuesController);
roomRoutes.get("/:roomId/occupancy", roomOccupancyController);
roomRoutes.post("/rentals", createRentalController);
roomRoutes.get("/rentals/me", getUserRentalsController);

export default roomRoutes;
