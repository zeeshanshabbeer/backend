const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const SOS = require("../models/SchemeOfStudyModel");
const ElectiveCourse = require("../models/ElectiveCoursesModel");

//  1. create the schema
//  2. post the data in schema
//  3. get all the data in schema

//--------------------------------------------SCHEME OF STUDY---------------------------------------

//post the data
exports.sos = catchAsync(async (req, res, next) => {
  const record = await SOS.findOne({ courseName: req.body.courseName });
  if (!record) {
    const student = await SOS.create(req.body);
    // const student = new SOS({
    //   courseCode,
    //   courseName,
    //   credits,
    //   semester,
    // });
    // await student.prereq(course);
    // await student.save();
    res.status(200).json({
      status: "success",
      message: "Uploaded Successfully",
    });
    // res.status(200).send(student);
  } else {
    return next(new AppError("This course Already added", 400));
    // res.send("this course already added");
  }
});
//get all courses of sos
exports.sos_courses = catchAsync(async (req, res, next) => {
  const courses = await SOS.find();
  if (!courses) {
    return next(new AppError("No Record Found", 400));
    // res.send("no record found");
  } else {
    res.status(200).json({
      status: "success",
      message: courses,
    });
    // res.send(courses);
  }
});
//ELECTIVE COURSES
exports.ELECTIVE_COURSES = catchAsync(async (req, res, next) => {
  const record = await ElectiveCourse.findOne({
    courseName: req.body.courseName,
  });
  if (!record) {
    const student = await ElectiveCourse.create(req.body);
    res.status(200).json({
      status: "success",
      message: "Upload Successfully",
    });
    // res.status(200).send(student);
  } else {
    return next(new AppError("This Course already Added", 400));
    // res.send("this course already added");
  }
});
//get sos course and elective courses
exports.AllCourses = catchAsync(async (req, res) => {
  const sos = await SOS.find();
  for (let i = 0; i < sos.length; i++) {
    if (
      sos[i].courseCode === "--" ||
      sos[i].courseCode === "CSC498" ||
      sos[i].courseCode === "CSC499"
    ) {
      sos.splice(i, 1);
      i--;
    }
  }

  const elec = await ElectiveCourse.find();
  const courses = sos.concat(elec);
  res.status(200).json({
    status: "success",
    message: courses,
  });
});
