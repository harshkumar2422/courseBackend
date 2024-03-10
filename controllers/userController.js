import { catchASyncError } from "../middlewares/catchAssyncError.js";
import { User } from "../models/UserModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { Course } from "../models/courseModel.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/stats.js";

export const register = catchASyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return next(new ErrorHandler("please enter all fields", 400));

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("user already exist", 409));

  const hashedpassword = await bcrypt.hash(password, 10);

  const file = req.file;

  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  user = await User.create({
    name,
    email,
    password: hashedpassword,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, res, 201, "user created successfully");
});

export const login = catchASyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("please enter all fields", 400));

  let user = await User.findOne({ email }).select("+password");
  console.log(user.subscription)
  if (!user) return next(new ErrorHandler("user doesn't exist"), 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return next(new ErrorHandler("Incorrect email or password"), 401);

  sendToken(user, res, 200, `welcome back ${user.name}`);
});

export const logout = catchASyncError(async (req, res, next) => {
  res
    .status(200)
    .clearCookie("token",{
      // expires: new Date(Date.now()),
      httpOnly: true,
      secure:true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

export const getalluser = async (req, res, next) => {
  const users = await User.find().select("+password");
  res.status(200).json({
    success: true,
    users,
  });
};

export const getmyprofile = catchASyncError(async (req, res, next) => {
  const user = await User.findById(req.user);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updatePassword = catchASyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("please enter all fields", 400));
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return next(new ErrorHandler("Incorrect oldPassword ", 400));

  if (newPassword)
    user.password = bcrypt.hashSync(newPassword, 10) || user.password;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const udateProfilepicture = catchASyncError(async (req, res, next) => {
  const file = req.file;
  const user = await User.findById(req.user._id);

  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "profile picture updataed successfuly ",
  });
});

export const updateProfile = catchASyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

export const forgetpassword = catchASyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("user not found", 400));

  const resetToken = await user.getResetToken();

  await user.save();

  const url = `${process.env.FRONTEND_URL}/resetToken/${resetToken}`;
  const message = `Click on the link to reset your password. ${url}. if you have not requested then please ignore`;
  //send reset token via email

  await sendEmail(user.email, "Course project reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset token has been sent to ${user.email}`,
  });
});

export const resetPassword = catchASyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .toString("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user)
    return next(new ErrorHandler("token is invalid or has been expired", 401));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  res.status(200).json({
    success: true,
    message: "the password has been reset successfully",
  });
});

export const addtoPlalist = catchASyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);

  if (!course) return next(new ErrorHandler("Ivalid course id", 404));

  const itemexist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });

  if (itemexist) return next(new ErrorHandler("item already exist", 409));
  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });
  await user.save();

  res.status(200).json({
    success: true,
    message: "Add to playlist",
  });
});

export const removeFromPlaylist = catchASyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.query.id);

  if (!course) return next(new ErrorHandler("Ivalid course id", 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });
  user.playlist = newPlaylist;
  await user.save();

  res.status(200).json({
    success: true,
    message: "removed from playlist",
  });
});

export const updateRole = catchASyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  if (user.role === "user") {
    user.role = "admin";
  } else {
    user.role = "user";
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "role updated",
  });
});

export const deletedUser = catchASyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const deletemyprofile = catchASyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  await user.deleteOne();

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: " deleted successfully",
    });
});

// User.watch().on("change",async()=>{
//   const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
//   const subscription = await User.find({ "subscription.status": "active" })
//   console.log(subscription.status);
//   try {
//     stats[0].subscription = subscription.length;
//     stats[0].users = await User.countDocuments()
//     stats[0].createdAt = new Date(Date.now())
    
//     await stats[0].save()
//   } catch (error) {
//     console.log(error);
//   }
 

// })