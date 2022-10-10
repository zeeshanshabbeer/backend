const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const BA_authController = require("../Controllers/BA_authController");

const DegreePlannerController = require("../Controllers/DegreePlannerController");

router.get("/DegreePlanner",S_authController.protect, DegreePlannerController.degreeplanner);

module.exports = router;
