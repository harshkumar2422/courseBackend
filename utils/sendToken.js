import jwt from "jsonwebtoken"


export const sendToken = (user, res, statusCode, message)=>{

const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET)

    const option ={

        expires: new Date(Date.now()+ 15*24*60*60*1000),
        httpOnly: true,
        secure:true,
        sameSite:"none",
    }

    res.status(statusCode).cookie("token",token,option).json({
        success:true,
        message,
        token,
        user
    })
}