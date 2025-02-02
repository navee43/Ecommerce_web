import { Router } from "express";
import { registerUser
     ,LoginUser 
     ,LogoutCurrentUser
      ,getAllUsers 
      ,getCurrentUser
       ,UpdateCurrentUserProfile,
       deleteUser,
       getuserbyid,
       updateUserById
    
    
    
    } from "../controllers/user.Controller.js";



import { verifyJWT,authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/register").post(registerUser).get(verifyJWT,authorizeAdmin,getAllUsers)
router.route("/login").post(LoginUser)
router.route("/logout").post(verifyJWT , LogoutCurrentUser)
router.route("/getCurrentUser").get(verifyJWT , getCurrentUser).put(verifyJWT,UpdateCurrentUserProfile)

//Admin routes 
router.route("/:id").delete(verifyJWT,authorizeAdmin,deleteUser).get(verifyJWT,authorizeAdmin,getuserbyid)
.put(verifyJWT,authorizeAdmin,updateUserById)


export default router;