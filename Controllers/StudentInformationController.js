const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const AddCourse = require("../models/AddCourseModel");
const SOS = require("../models/SchemeOfStudyModel");
const ELECTIVE_COURSES = require("../models/ElectiveCoursesModel");
const Student = require("../models/StudentModel");
const BatchAdvisor = require("../models/BatchAdvisorModel");

//student information controller

//studentsinformations
exports.StudentsInformations = catchAsync(async (req, res, next) => {
  const data = req.rootuser;
  const batch = data.batch;
  const studentDetail = await Student.find({ batch: batch });
  if (!studentDetail) {
    return next(new AppError("No student Registered", 400));
    //  res.status(400).send("error");
  } else {
    res.status(200).json({
      status: "success",
      message: studentDetail,
    });
    // res.send(studentDetail);
  }
});
//get student result card
exports.StudentResult = catchAsync(async (req, res, next) => {
  const data = await Student.findById(req.params._id);
  if (!data) {
    return next(new AppError("No Result found", 400));
    // res.status(200).send("no record found");
  } else {
    res.status(200).json({
      status: "success",
      message: data.Result[0],
    });
    // res.status(200).send(data.Result[0]);
  }
});
// get specific student data

exports.Studentrecord = catchAsync(async (req, res) => {
  const { registrationId } = req.params;
  console.log(registrationId);
  const student = await Student.findOne({ registrationId });
  if (!student) {
    return next(new AppError("No Result found", 400));
    // res.send("no record found");
  } else {
    res.status(200).json({
      status: "success",
      message: student,
    });
    // res.send(student);
  }
});
