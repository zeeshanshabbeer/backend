const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const SechemeOfStudyController = require("../Controllers/SechemeOfStudyController");

router.post("/ElectiveCourse", SechemeOfStudyController.ELECTIVE_COURSES);
//post the sos data
router.post("/SOS", SechemeOfStudyController.sos);
//get all the sos data
router.get("/SOS_courses", SechemeOfStudyController.sos_courses);
//get sos course and elective courses
router.get(
  "/AllCourses",
  S_authController.protect,
  SechemeOfStudyController.AllCourses
);

module.exports = router;
