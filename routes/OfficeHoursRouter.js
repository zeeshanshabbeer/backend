const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");

const OfficeHoursController = require("../Controllers/OfficeHoursController");
//batch advisor add office hours
router.post(
  "/officehours/:day/:from/:to",
  BA_authController.protect,
  OfficeHoursController.UploadOfficeHours
);
//view office hours to student
router.get(
  "/officehour",
  S_authController.protect,
  OfficeHoursController.S_OfficeHour
);
//batch advisor view office hour
router.get(
  "/officehours",
  BA_authController.protect,
  OfficeHoursController.BA_OfficeHours
);

module.exports = router;
