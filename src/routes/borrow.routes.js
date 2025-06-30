import { Router } from "express";
import {  verifyAdmin, verifyJWT } from "../middlewears/auth.middlewears.js";
import { borrowBook,  getAllBorrowedBooks, getUserBorrowBook, handleOverdueBooks, renewBook, returnBook, userBorrowedBooks } from "../controllers/borrow.controller.js";

const borrowRouter = Router();

borrowRouter.route("/borrowBook/:bookId").post(verifyJWT,borrowBook);
borrowRouter.route('/getUserBorrowBook/:userId').get(verifyJWT,verifyAdmin,getUserBorrowBook)
borrowRouter.route('/returnBook/:bookId').post(verifyJWT,returnBook)
borrowRouter.route('/renewBook/:bookId').patch(verifyJWT,renewBook)
borrowRouter.route('/getBorrowBook').get(verifyJWT,userBorrowedBooks)
borrowRouter.route('/userBorrowBook').get(verifyJWT,verifyAdmin,getAllBorrowedBooks)
borrowRouter.route('/handleOverdueBooks').patch(verifyJWT, verifyAdmin, handleOverdueBooks);
// borrowRouter.route('/fineAmount/:borrowId').get(verifyJWT, fineAmount);


export default borrowRouter;