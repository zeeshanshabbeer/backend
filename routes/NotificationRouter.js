const express = require("express");
const router = express.Router();
const S_notificationController = require("../Controllers/S_NotificationController");
const BA_NotificationController = require("../Controllers/BA_NotificationController");
const StudentController = require("../Controllers/S_authController");
const BatchAdvisorController = require("../Controllers/BA_authController");

// Student Notification
router.get(
  "/S_notification",
  StudentController.protect,
  S_notificationController.Notifications
);

// Batch Advisor Notification
router.get(
  "/BA_notification",
  BatchAdvisorController.protect,
  BA_NotificationController.BA_Notifications
);

// student router to post
router.post(
  "/AB",
  StudentController.protect,
  S_notificationController.uploadNotification
);

// batch advisor notification
router.post(
  "/ABC",
  BatchAdvisorController.protect,
  BA_NotificationController.uploadNotification
);
module.exports = router;
