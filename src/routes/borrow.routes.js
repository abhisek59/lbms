import { Router } from "express";
import {  verifyJWT } from "../middlewears/auth.middlewears.js";
import { borrowBook } from "../controllers/borrow.controller.js";

const borrowRouter = Router();

borrowRouter.route("/borrowBook/:bookId").post(verifyJWT,borrowBook)


export default borrowRouter;