import express from "express";
import {
  addLectures,
  courseLectures,
  createCourse,
  deleteCourse,
  deleteLecture,
  getallCourse,
} from "../controllers/courseController.js";
import { authorizadmin, authorizSubscribers, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/courses").get(getallCourse);
router
  .route("/createcourse")
  .post(isAuthenticated, authorizadmin, singleUpload, createCourse);
//add lecture , delete course, get course details
router
  .route("/course/:id")
  .get(isAuthenticated ,courseLectures)
  .post(isAuthenticated, authorizadmin, singleUpload, addLectures)
  .delete(isAuthenticated, authorizadmin, deleteCourse);

  router.route("/lecture").delete(isAuthenticated, authorizadmin, deleteLecture)

export default router;
