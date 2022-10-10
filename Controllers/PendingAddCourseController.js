const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const PendingAddCourse = require("../models/pendingAddCourseModel");

//post data in pendingadd course
//when click on add button
exports.AddpendingCourses = catchAsync(async (req, res, next) => {
  const {
    courseName,
    courseCode,
    credits,
    section,
    preReqCourse,
    preTest,
    reason,
  } = req.body;
  const { registrationId } = req.rootuser;
  const record = await PendingAddCourse.findOne({ registrationId });
  if (!record) {
    const addrecord = new PendingAddCourse({
      registrationId,
    });
    await addrecord.add_courses(
      courseName,
      courseCode,
      credits,
      section,
      preReqCourse,
      preTest,
      reason
    );
    // await preReqCourse.add_preReq(course)
    await addrecord.save();
    res.status(200).json({
      status: "success",
      message: "Upload Data Successfully",
    });
    // res.send(addrecord);
  } else {
    await record.add_courses(
      courseName,
      courseCode,
      credits,
      section,
      preReqCourse,
      preTest,
      reason
    );
    await record.save();
    res.status(200).json({
      status: "success",
      message: "Upload data Successfully",
    });
  }
});
// get all the pending addcourses get
exports.AddCourses = catchAsync(async (req, res) => {
  const { registrationId } = req.rootuser;
  const record = await PendingAddCourse.findOne({ registrationId });
  if (!record) {
    let data = [];
    res.status(200).json({
      status: "success",
      message: data,
    });
  } else {
    res.status(200).json({
      status: "success",
      message: record.courses,
    });
  }
});
// delete all records in pendingadd course delete
exports.deleteRecord = catchAsync(async (req, res, next) => {
  const { registrationId } = req.rootuser;
  const record = await PendingAddCourse.findOne({ registrationId });
  if (record) {
    await record.delete();
    res.status(200).json({
      status: "success",
      message: "Delete Successfully",
    });
    // res.send("deleted");
  } else {
    return next(new AppError("No Record Found", 400));
    // res.send("already record deleted");
  }
});
//delete specific data from courseCode
exports.DeleteSpecificRecord = catchAsync(async (req, res, next) => {
  const { courseName } = req.params;
  const { registrationId } = req.rootuser;
  const record = await PendingAddCourse.findOne({ registrationId });
  if (!record) {
    return next(new AppError("No Record Found", 400));
    // res.status(400).send("no record found");
  } else {
    for (let i = 0; i < record.courses.length; i++) {
      if (record.courses.length === 1) {
        await record.delete();
        res.status(200).json({
          status: "success",
          message: "Delete Successfully",
        });
        // res.status(200).json("deleted");
      } else {
        if (record.courses[i].courseName === courseName) {
          await record.courses.splice(i, 1);
          await record.save();
        }
        res.status(200).json({
          status: "success",
          message: "Delete Successfully",
        });
        // res.status(200).json("deleted");
      }
    }
  }
});
