const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");

const BatchAdvisorController = require("../Controllers/BatchAdvisorController");

router.post("/BA_registration", BA_authController.registration);
router.post("/BatchAdvisorLogin", BA_authController.Login);
router.get(
  "/BatchAdvisorProfile",
  BA_authController.protect,
  BA_authController.Profile
);
router.get(
  "/BatchAdvisorLogout",
  BA_authController.protect,
  BA_authController.Logout
);
router.put(
  "/BA_updatepassword",
  BA_authController.protect,
  BatchAdvisorController.BA_updatepassword
);
router.put(
  "/BA_updatecontact",
  BA_authController.protect,
  BatchAdvisorController.BA_updatecontact
);
router.put("/BA_resetpassword", BatchAdvisorController.BA_resetpassword);
router.post("/BA_sendresetemail", BatchAdvisorController.BA_sendresetemail);
//topmenu of batchadvisor
router.get(
  "/BA_Topmenu",
  BA_authController.protect,
  BatchAdvisorController.BA_TopMenu
);
// Home
router.get(
  "/Add_Drop_Freeze_pending",
  BA_authController.protect,
  BatchAdvisorController.BA_Home
);

module.exports = router;
