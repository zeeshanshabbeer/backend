const express = require("express");
const router = express.Router();
const GuidanceController = require("../Controllers/GuidanceController");
const S_authController = require("../Controllers/S_authController");

//need guidance
router.get(
  "/Guidance/:course",
  S_authController.protect,
  GuidanceController.needguidance
);
// wangt to guide
router.post(
  "/want_to_guide/:course",
  S_authController.protect,
  GuidanceController.want_to_guidecourse
);
//want to guide  add contact no
router.post(
  "/wantToGuide_contact/:add",
  S_authController.protect,
  GuidanceController.wantToGuide_contact
);
//delete the courses that added to guide
router.delete(
  "/Guidance/delete/:course",
  S_authController.protect,
  GuidanceController.delete_course
);
// get the data
router.get(
  "/guide_courses",
  S_authController.protect,
  GuidanceController.guide_courses
);

// check the for contactNo
router.get(
  "/ContactNo",
  S_authController.protect,
  GuidanceController.checkBoxPhone
);

module.exports = router;
