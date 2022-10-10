const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");
const DropCourseController = require("../Controllers/DropCourseController");

//drop course  request
router.post(
  "/DropCourse",
  S_authController.protect,
  DropCourseController.dropCourse_Request
);
//drop course on ok
router.post(
  "/dropcoursess",
  BA_authController.protect,
  DropCourseController.dropcoursess
);
//reject drop courses
router.delete(
  "/delete_DropRequest",
  BA_authController.protect,
  DropCourseController.delete_DropRequest
);
//Drop form
router.get(
  "/Drop_Form/:registrationId",
  BA_authController.protect,
  DropCourseController.DropForm
);
module.exports = router;
