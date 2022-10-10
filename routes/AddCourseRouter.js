const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");
const AddCourseController = require("../Controllers/AddCourseController");
const { upload1 } = require("../utils/multer");

// on student side
//delete the course that add-------------student side
router.delete(
  "/delete_addcourse_request",
  S_authController.protect,
  AddCourseController.DeleteAddCourseRequest
);
//-----------------courses that student can add--------------
router.get(
  "/CoursesThatAdded",
  S_authController.protect,
  AddCourseController.courses_that_added
);
//for add course get  creidts hours
router.get(
  "/CreditHour",
  S_authController.protect,
  AddCourseController.CreditHours
);
//reject Add course course BatchAdvisor
router.delete(
  "/delete_AddPending",
  BA_authController.protect,
  AddCourseController.DeleteAddPending
);
// submit add form requests(teacher accept request)
router.post(
  "/Add_Coursess_Submit",
  BA_authController.protect,
  AddCourseController.AddCoursesSubmit
);
//submit button student side
router.post(
  "/submit_AddForm",
  upload1.single("fee"),
  S_authController.protect,
  AddCourseController.SubmitAddForm
);

//get the specific student add request ( Add Form )
router.get(
  "/Add_Form/:registrationId",
  BA_authController.protect,
  AddCourseController.AddForm
);
// Add Form
// router.get(
//   "/Add_Form/:registrationId",
//   S_authController.protect,
//   AddCourseController.AddForm
// );

module.exports = router;
