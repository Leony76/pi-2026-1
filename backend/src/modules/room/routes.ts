import { Router } from "express";

import { enterpriseDashboardController, enterpriseValuesController, listRoomsController, createRentalController, getUserRentalsController, roomOccupancyController, createRoomController, getRoomDetailsController, updateRoomController, toggleRoomAvailabilityController } from "./controller";

const roomRoutes = Router();

roomRoutes.get("/", listRoomsController);
roomRoutes.post("/", createRoomController);
roomRoutes.get("/dashboard", enterpriseDashboardController);
roomRoutes.get("/values", enterpriseValuesController);
roomRoutes.get("/:roomId/occupancy", roomOccupancyController);
roomRoutes.post("/rentals", createRentalController);
roomRoutes.get("/rentals/me", getUserRentalsController);
roomRoutes.get("/:roomId/details", getRoomDetailsController);
roomRoutes.patch("/:roomId/update", updateRoomController);
roomRoutes.patch("/:roomId/switchAvailability", toggleRoomAvailabilityController);

export default roomRoutes;
