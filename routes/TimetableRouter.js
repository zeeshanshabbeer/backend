const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const timetableController = require("../Controllers/TimetableController");
//add timetable in database
router.post("/Timetable", timetableController.timetable);
//remove clashes
router.get(
  "/TimetableClashes/:subject",
  S_authController.protect,
  timetableController.TimetableClashes
);
// student current timetable
router.get(
  "/StudentTimetable",
  S_authController.protect,
  timetableController.StudentTimetable
);

module.exports = router;
