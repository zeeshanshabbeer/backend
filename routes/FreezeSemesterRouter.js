const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");
const FreezeSemesterController = require("../Controllers/FreezeSemesterController");

router.post(
  "/FreezeSemester",
  S_authController.protect,
  FreezeSemesterController.FreezeSemester
);
router.delete(
  "/FreezeSemester_reject",
  BA_authController.protect,
  FreezeSemesterController.FreezeSemester_reject
);

router.post(
  "/FreezeSemester_Accept",
  BA_authController.protect,
  FreezeSemesterController.FreezeSemester_accept
);

router.get(
  "/Freeze_Form/:registrationId",
  BA_authController.protect,
  FreezeSemesterController.FreezeForm
);

module.exports = router;
