const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");

const PendingAddCourseController = require("../Controllers/PendingAddCourseController");
//post data in pendingadd course
//when click on add post
router.post(
  "/AddpendingCourses",
  S_authController.protect,
  PendingAddCourseController.AddpendingCourses
);
//get all the pending addcourses
router.get(
  "/AddCourses",
  S_authController.protect,
  PendingAddCourseController.AddCourses
);
//delete all records in pendingadd course delete
router.delete(
  "/deleteRecord",
  S_authController.protect,
  PendingAddCourseController.deleteRecord
);
//delete specific data from courseCode
router.delete(
  "/DeleteSpecificRecord/:courseName",
  S_authController.protect,
  PendingAddCourseController.DeleteSpecificRecord
);

module.exports = router;
