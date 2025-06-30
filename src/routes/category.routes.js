
import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../middlewears/auth.middlewears.js";
import { addBookToCategory, createCategory, removeBookFromCategory, updateCategory } from "../controllers/category.controller.js";

const categoryRouter = Router();
categoryRouter.route('/create').post(verifyJWT,verifyAdmin,createCategory)
categoryRouter.route('/updatecat/:categoryId').patch(verifyJWT,verifyAdmin,updateCategory)
categoryRouter.route('/addBookToCategory/book/:bookId/category/:categoryId').post(verifyJWT,verifyAdmin,addBookToCategory)
categoryRouter.route('/removeBookFromcat/book/:bookId/category/:categoryId').patch(verifyJWT,verifyAdmin,removeBookFromCategory)


export default categoryRouter;