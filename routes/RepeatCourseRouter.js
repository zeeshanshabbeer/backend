const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");

const RepeatCourseController = require("../Controllers/RepeatCourseController");

router.get(
  "/RepeatCourse",
  S_authController.protect,
  RepeatCourseController.RepeatCourses
);

module.exports = router;
