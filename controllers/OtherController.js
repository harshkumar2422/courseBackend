import { catchASyncError } from "../middlewares/catchAssyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Stats } from "../models/stats.js";

export const contact = catchASyncError(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return next(new ErrorHandler("please enter all fields", 400));
  const to = process.env.MYMAIL;
  const subject = "contact form course bundler";
  const text = `I am ${name} and my email is ${email}. \n${message}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "your message has been sent",
  });
});
export const courseRequest = catchASyncError(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course)
    return next(new ErrorHandler("please enter all fields", 400));

  const to = process.env.MYMAIL;
  const subject = "Request for a course";
  const text = `I am ${name} and my email is ${email}. \n${course}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "your request  has been sent",
  });
});
export const getDashBoardstats = catchASyncError(async (req, res, next) => {
  const stats = await Stats.find({}).sort({ cretaedAt: "desc" }).limit(12);

  const statsdata = [];

  for (let i = 0; i < stats.length; i++) {
    statsdata.unshift(stats[i]);
  }
  const requiredData = 12 - stats.length;
  for (let i = 0; i < requiredData; i++) {
    statsdata.unshift({
      users: 0,
      subscription: 0,
      views: 0,
    });
  }

  const usersCount = statsdata[11].users;
  const subscriptionCount = statsdata[11].subscription;
  const viewsCount = statsdata[11].views;

  let userPercentage = true,
    viewsPercentage = true,
    subscriptionPercentage = true;

  let userProfit = true,
    viewsProfit = true,
    subscriptionProfit = true;

  if ((statsdata[10].users = 0)) userPercentage = usersCount * 100;
  if ((statsdata[10].views = 0)) viewsPercentage = viewsCount * 100;
  if ((statsdata[10].subscription = 0))
    subscriptionPercentage = subscriptionCount * 100;
  else {
    const difference = {
      users: statsdata[11].users - statsdata[10].user,
      views: statsdata[11].views - statsdata[10].views,
      subscription: statsdata[11].subscription - statsdata[10].subscription,
    };
    userPercentage = (difference.users / statsdata[10].users) * 100;
    viewsPercentage = (difference.views / statsdata[10].views) * 100;
    subscriptionPercentage =
      (difference.subscription / statsdata[10].subscription) * 100;

    if (userPercentage < 0) userProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionPercentage < 0) subscriptionProfit = false;
  }

  res.status(200).json({
    success: true,
    stats: statsdata,
    usersCount,
    subscriptionCount,
    viewsCount,
    userPercentage,
    viewsPercentage,
    subscriptionPercentage,
    userProfit,
    viewsProfit,
    subscriptionProfit,
  });
});
