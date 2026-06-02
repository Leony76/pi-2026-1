import { Router } from "express";

import { RoomController } from "./controller";

const roomRoutes = Router();

roomRoutes.get("/"                             , RoomController.listRooms);
roomRoutes.post("/"                            , RoomController.createRoom);
roomRoutes.get("/dashboard"                    , RoomController.enterpriseDashboard);
roomRoutes.get("/values"                       , RoomController.enterpriseValues);
roomRoutes.patch("/:roomId/remove"             , RoomController.remove);
roomRoutes.get("/:roomId/occupancy"            , RoomController.roomOccupancy);
roomRoutes.post("/rentals"                     , RoomController.createRental);
roomRoutes.get("/rentals/me"                   , RoomController.getUserRentals);
roomRoutes.get("/:roomId/details"              , RoomController.getRoomDetails);
roomRoutes.patch("/:roomId/update"             , RoomController.updateRoom);
roomRoutes.patch("/:roomId/switchAvailability" , RoomController.toggleRoomAvailability);

export default roomRoutes;
