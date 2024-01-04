import express from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { buySubscription, cancelsubscription, paymentverification, razorpaykey } from "../controllers/paymentController.js";

const router = express.Router()
//Buy subscription
router.route("/subscription").get(isAuthenticated,buySubscription)
router.route("/paymentvrification").post(isAuthenticated,paymentverification)
router.route("/razorpaykey").get(razorpaykey)
router.route("/subscribe/cancel").delete(isAuthenticated,cancelsubscription)

export default router;