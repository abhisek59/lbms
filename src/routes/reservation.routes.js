import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../middlewears/auth.middlewears.js";
import { getAllReservations, getMyReservations, getReservation, makeReservation, updateReservation } from "../controllers/reservation.controller.js";


const reservationRouter = Router(); 

reservationRouter.route("/reserveBook/:bookId").post(verifyJWT,makeReservation)
reservationRouter.route('/getReservations/:reservationId').get(verifyJWT,getReservation);
reservationRouter.route('/getMyReservations').get(verifyJWT, getMyReservations)
reservationRouter.route('/getAllReservations/:userId').get(verifyJWT,verifyAdmin,getAllReservations);
reservationRouter.route('/updateReservation/:reservationId').patch(verifyJWT,updateReservation);
reservationRouter.route('/deleteReservation/:reservationId').delete(verifyJWT,updateReservation);


export default reservationRouter;