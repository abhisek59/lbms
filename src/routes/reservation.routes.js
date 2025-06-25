import { Router } from "express";
import { verifyJWT } from "../middlewears/auth.middlewears.js";
import { makeReservation } from "../controllers/reservation.controller.js";

const reservationRouter = Router(); 

reservationRouter.route("/reserveBook/:bookId").post(verifyJWT,makeReservation)

export default reservationRouter;