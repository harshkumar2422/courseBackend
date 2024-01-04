import express from "express";
import { addtoPlalist, deletedUser, deletemyprofile, forgetpassword, getalluser, getmyprofile, login, logout, register, removeFromPlaylist, resetPassword, udateProfilepicture, updatePassword, updateProfile, updateRole } from "../controllers/userController.js";
import { authorizadmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router()

router.route("/register").post(singleUpload,register)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/me").get(isAuthenticated , getmyprofile).delete(isAuthenticated,deletemyprofile)
router.route("/changepassword").put(isAuthenticated , updatePassword)
router.route("/updateProfile").put(isAuthenticated , updateProfile)
router.route("/updateProfilepicture").put(isAuthenticated ,singleUpload, udateProfilepicture)
//forgetPassword
router.route("/forgetpassword").post(forgetpassword)
//resetpassword
router.route("/resetToken/:token").put(resetPassword)
//add to playlst
router.route("/addtoplaylist").post(isAuthenticated,addtoPlalist)
//remove from  to playlst
router.route("/removeplaylist").delete(isAuthenticated,removeFromPlaylist)
router.route("/admin/Users").get(isAuthenticated,authorizadmin,getalluser)
router.route("/admin/User/:id").put(isAuthenticated,authorizadmin,updateRole).delete(isAuthenticated,authorizadmin,deletedUser)


export default router