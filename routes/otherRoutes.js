import express from "express"
import { contact, courseRequest, getDashBoardstats } from "../controllers/OtherController.js";
import { authorizadmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();


router.route("/contact").post(contact)
//course request
router.route("/courserequest").post(courseRequest)

//getAdmin dashboard stats
router.route("/admin/stats").get(isAuthenticated,authorizadmin,getDashBoardstats)


export default router