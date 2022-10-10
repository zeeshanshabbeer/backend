const express = require("express");
const router = express.Router();
const Student = require("../models/StudentModel");
const GuidanceBox = require("../models/guidance");
const ApprovedRequest = require("../models/ApprovedRequest");
const CourseRequest = require("../models/DropCourse");
const FreezeSemester = require("../models/FreezeSemester");
const AddCourse = require("../models/Addcourse");
const S_authenticate = require("../middleware/S_authenticate");
const BA_authenticate = require("../middleware/BA_authenticate");
const sendEmail = require("../middleware/sendemail");
const multer = require("multer");
const nodemailer = require("nodemailer");

//-----------------------multer------------------
// const feestorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "../frontend/public/feeChallan");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });
// const upload_fee = multer({
//   storage: feestorage,
// });
//upload fee challan and submit it ----------student side
//get the specific student add request ( Add Form )
exports.AddForm = catchAsync(async (req, res) => {
  const { registrationId } = req.body;
  const data = await AddCourse.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
    // res.status(400).send("no record found");
  } else {
    res.status(200).send(data);
  }
});
//delete the specific course add request ( Add Form )
// router.delete("/delete_add_course", async (req, res) => {
//   try {
//     const { courseName, registrationId } = req.body;
//     const data = await AddCourse.findOne({ registrationId });
//     if (!data) {
//       res.status(400).send("no record found");
//     } else {
//       for (let i = 0; i < data.courses.length; i++) {
//         if (data.courses[i].courseName === courseName) {
//           await data.courses.splice(i, 1);
//           await data.save();
//           res.status(200).send("deleted successfully");
//         }
//       }
//     }
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

//
// router.post("/officehourdata/:batch", async (req, res) => {
//   const { batch } = req.params;
//   const record = await OfficeHour.findOne({ batch });
//   await record.create(req.body);
//   res.send(record);
// });
// -----------------------------------ADD,Drop,Freeze requests------------------------------

//  1. create the schema
//  2. post the data in schema
//  3. get all the data in schema

module.exports = router;
