import { Router } from "express";
import { upload } from "../middlewears/multer.middlewears.js";// Assuming you have a multer setup in utils
import { verifyJWT, verifyAdmin } from "../middlewears/auth.middlewears.js";
import { addBook, getAllBooks, getBookById, updateBook } from "../controllers/book.controller.js";


 const bookRouter = Router();

bookRouter.route("/addBook").post(
  verifyJWT,
  verifyAdmin,
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
addBook
);
bookRouter.route("/updateBook/:bookId").patch(
  verifyJWT,
  verifyAdmin,
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
 updateBook
);
bookRouter.route("/getBookById/:bookId").get(
  verifyJWT,verifyAdmin 
  ,getBookById
);
  bookRouter.route("/deleteBook/:bookId").delete(
  verifyJWT,
  verifyAdmin,
  getBookById
);
bookRouter.route("/search").get(
  verifyJWT
  ,getAllBooks
);
export default bookRouter;