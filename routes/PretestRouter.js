const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");

const PretestController = require("../Controllers/PretestController");
//upload the questions
router.post(
  "/Add_Question",
  S_authController.protect,
  PretestController.Add_Question
);
//verify the answers
router.post(
  "/verifyAnswer/:courseName",
  S_authController.protect,
  PretestController.verifyAnswer
);
//get all the questions
router.get(
  "/getQuestions/:courseName",
  S_authController.protect,
  PretestController.getQuestions
);
//pretest
router.post("/UploadPreTestData", PretestController.UploadPreTestData);

module.exports = router;
