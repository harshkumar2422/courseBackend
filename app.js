import express from "express";
import{ config} from "dotenv";
import courseRouter from "./routes/courseRoutes.js"
import userRouter from "./routes/userRoutes.js"
import payment from "./routes/PaymentRoutes.js"
import other from "./routes/otherRoutes.js"
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors"

config({path :"./config.env"})
export const app = express();

// using middleware

app.use(express.json())
app.use(
    express.urlencoded({
        extended:true,
    })
)

app.use(cookieParser());
app.use(cors())

//using rutes 
app.use("/api/v1",courseRouter)
app.use("/api/v1",userRouter)
app.use("/api/v1",payment)
app.use("/api/v1",other)

app.get("/",(req,res)=>{
    res.send("server is working")
})


app.use(ErrorMiddleware) 
