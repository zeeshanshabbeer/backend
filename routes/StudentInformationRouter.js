const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");

const StudentInformationController = require("../Controllers/StudentInformationController");

//all the student information
router.get(
  "/StudentInformation",
  BA_authController.protect,
  StudentInformationController.StudentsInformations
);
//view result of student
router.get(
  "/StudentResult/:_id",
  BA_authController.protect,
  StudentInformationController.StudentResult
);
// get specific student data
router.get(
  "/GetStudentData/:registrationId",
  BA_authController.protect,
  StudentInformationController.Studentrecord
);
module.exports = router;
