
import { Router } from "express";

import { changePassword, login, logout, register } from "../controllers/user.controller.js";
import { upload } from "../middlewears/multer.middlewears.js";// Assuming you have a multer setup in utils
import { verifyJWT } from "../middlewears/auth.middlewears.js";

const registerRouter = Router();    

registerRouter.route("/register").post( 
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        }
    ]),
    register

) 
registerRouter.route('/login').post(login)
registerRouter.route('/logout').post(verifyJWT, logout)
registerRouter.route('/changePassword').patch(verifyJWT,changePassword)
export default registerRouter;
