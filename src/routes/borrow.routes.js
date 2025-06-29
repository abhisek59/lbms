import { Router } from "express";
import {  verifyAdmin, verifyJWT } from "../middlewears/auth.middlewears.js";
import { borrowBook, getUserBorrowBook, returnBook } from "../controllers/borrow.controller.js";

const borrowRouter = Router();

borrowRouter.route("/borrowBook/:bookId").post(verifyJWT,borrowBook);
borrowRouter.route('/getUserBorrowBook/:userId').get(verifyJWT,verifyAdmin,getUserBorrowBook)
borrowRouter.route('/returnBook/:bookId').post(verifyJWT,returnBook)


export default borrowRouter;