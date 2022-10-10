const express = require("express");
const router = express.Router();
const S_authController = require("../Controllers/S_authController");
const PastpaperController = require("../Controllers/PastpaperController");
const { uploadPastPaper } = require("../utils/multer");

router.get(
  "/paper/:course_title/:paper_type/:session",
  S_authController.protect,
  PastpaperController.ViewPastPapers
);
//specific file
router.get(
  "/papers/:_id",
  S_authController.protect,
  PastpaperController.ViewSpecificPaper
);
//upload past paper
router.post(
  "/upload_pastpapers",
  uploadPastPaper.single("paper"),
  S_authController.protect,
  PastpaperController.upload_pastpapers
);

module.exports = router;
