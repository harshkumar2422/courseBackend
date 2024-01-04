import {app} from './app.js'
import {connectDB} from './data/database.js'
import cloudinary from "cloudinary"
import RazorPay from "razorpay"
import nodeCron from "node-cron"
import {Stats} from "./models/stats.js"

connectDB()

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_CLIENT_SECRET,
     
})
export const instance =new RazorPay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
  nodeCron.schedule("0 0 0 1 * *",async()=>{
   try {
    await Stats.create({})
   } catch (error) {
    console.log(error)
   }
  })
const port = process.env.PORT || 4000
app.listen(port,()=>{
    console.log(`server is working at ${port}`);
})