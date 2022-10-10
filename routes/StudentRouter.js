const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");

const StudentController = require("../Controllers/StudentController");

router.post("/S_registration", S_authController.registration);
router.post("/Studentlogin", S_authController.login);
router.get(
  "/Studentprofile",
  S_authController.protect,
  S_authController.Profile
);
router.get("/Studentlogout", S_authController.protect, S_authController.Logout);
router.put(
  "/UpdatePassword",
  S_authController.protect,
  StudentController.S_updatepassword
);
router.put(
  "/UpdateContact",
  S_authController.protect,
  StudentController.S_updatecontact
);
router.put("/ResetPassword", StudentController.S_resetpassword);
router.post("/SendResetEmail", StudentController.S_sendresetemail);
//top menu of Student
router.get("/S_Topmenu", S_authController.protect, StudentController.S_TopMenu);
//-------------------home student--------------------
router.get("/Home", S_authController.protect, StudentController.Home);
//  get student credits hours
router.get(
  "/Home_credits",
  S_authController.protect,
  StudentController.HomeCredits
);

module.exports = router;
