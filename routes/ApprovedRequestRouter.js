const express = require("express");
const router = express.Router();
const BA_authController = require("../Controllers/BA_authController");
const ApprovedRequestController = require("../Controllers/ApprovedRequestController");

//GET DATA OF APPROVE REQUEST
router.get(
  "/ApprovedRequest",
  BA_authController.protect,
  ApprovedRequestController.ApprovedRequest
);
//DELETE DATA OF APPROVE REQUEST
router.delete(
  "/delete/:_id",
  BA_authController.protect,
  ApprovedRequestController.Delete
);

module.exports = router;
