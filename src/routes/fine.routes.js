import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../middlewears/auth.middlewears.js";
import { createFineAmount } from "../controllers/fine.controller.js";

const fineRouter = Router();

fineRouter.route('/fineAmt/:borrowId').post(verifyJWT,verifyAdmin,createFineAmount)

export default fineRouter;