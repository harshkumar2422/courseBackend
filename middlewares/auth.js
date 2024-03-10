import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchASyncError } from "./catchAssyncError.js";

export const isAuthenticated = catchASyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("first login", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);

  next();
});

export const authorizadmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource`,
        403
      )
    );
  next();
};
export const authorizSubscribers = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.subscription.status !== "active") {
    return next(
      new ErrorHandler("only subscribers can acccess this resource", 403)
    );
    next();
  }
};
