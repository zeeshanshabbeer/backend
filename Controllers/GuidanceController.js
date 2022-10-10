const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const GuidanceBox = require("../models/GuidanceModel");

//Guidance Box
//need guidance
exports.needguidance = catchAsync(async (req, res, next) => {
  const course = req.params.course;
  const data = await GuidanceBox.find({
    courses: { $elemMatch: { course: course } },
  });
  if (!data) {
    return next(new AppError("No Course Found", 400));
  } else {
    res.status(200).json({
      status: "success",
      message: data,
    });
  }
});
//want to guide
exports.want_to_guidecourse = catchAsync(async (req, res, next) => {
  const course = req.params.course;
  const user = req.rootuser;
  const registrationId = user.registrationId;
  const name = user.name;
  const email = user.email;
  const contactNo = "--";
  const box = await GuidanceBox.findOne({ registrationId });
  if (!box) {
    const guide = new GuidanceBox({ registrationId, name, email, contactNo });
    await guide.save();
    await guide.add(course);
    await guide.save();
    res.status(200).json({
      status: "success",
      message: "Course added successfully.",
    });
  } else {
    const array = box.courses.length;
    if (array === 0) {
      await box.add(course);
      await box.save();
      res.status(200).json({
        status: "success",
        message: "Course added successfully.",
      });
    } else if (array === 1) {
      if (box.courses[array - 1].course === course) {
        return next(new AppError("This course is already present.", 400));
      } else {
        await box.add(course);
        await box.save();
        res.status(200).json({
          status: "success",
          message: "Course added successfully.",
        });
      }
    } else if (array == 2) {
      if (
        box.courses[array - 1].course === course ||
        box.courses[array - 2].course === course
      ) {
        return next(new AppError("This course is already present.", 400));
        // return res.status(400).send("already present");
      } else {
        await box.add(course);
        await box.save();
        res.status(200).json({
          status: "success",
          message: "Course added successfully.",
        });
        // res.send(box);
      }
    } else {
      return next(new AppError("Maximum limit for courses is 3", 400));
      // res.status(400).send("limit full");
    }
  }
});
//add phone number or not
exports.wantToGuide_contact = catchAsync(async (req, res, next) => {
  const checkbox = req.params.add;
  if (checkbox === "true") {
    const user = req.rootuser;
    const contactNo = user.contactNo;
    const registrationId = user.registrationId;
    const data = await GuidanceBox.findOne({ registrationId });
    if (!data) {
      return next(new AppError("First add Some Courses", 400));
    } else {
      // data.contactNo=contactNo
      await data.Contact(contactNo);
      await data.save();
      res.status(200).json({
        status: "success",
        message: "Contact No Added Successfuly",
      });
    }
  } else {
    const user = req.rootuser;
    const contactNo = user.contactNo;
    const registrationId = user.registrationId;
    const data = await GuidanceBox.findOne({ registrationId });
    if (!data) {
      return next(new AppError("First add any course", 400));
    } else {
      data.contactNo = "--";
      await data.save();
      console.log(data);
      res.status(200).json({
        status: "success",
        message: "Remove Contact No Successfully",
      });
    }
  }
});
//delete the course that added for guide
exports.delete_course = catchAsync(async (req, res, next) => {
  const course = req.params.course;
  const user = req.rootuser;
  const registrationId = user.registrationId;
  const record = await GuidanceBox.findOne({
    registrationId,
  });
  if (!record) {
    return next(new AppError("No record found", 400));
    // res.send("no record");
  } else {
    for (var i = 0; i < record.courses.length; i++) {
      if (record.courses[i].course === course) {
        await record.courses.splice(i, 1);
        await record.save();
        res.status(200).json({
          status: "success",
          message: "Course deleted successfully",
        });
      }
    }
    if (record.courses.length === 0) {
      await record.delete();
      res.status(200).json({
        status: "success",
        message: "Course deleted successfully",
      });
    }
  }
});
// GET the data
exports.guide_courses = catchAsync(async (req, res) => {
  const user = req.rootuser;
  const registrationId = user.registrationId;
  const box = await GuidanceBox.findOne({ registrationId });
  if (!box) {
    const data = [];
    res.status(200).json({
      status: "success",
      message: data,
    });
  } else {
    res.status(200).json({
      status: "success",
      message: box.courses,
    });
  }
});

// GET the data
exports.checkBoxPhone = catchAsync(async (req, res) => {
  const user = req.rootuser;
  const registrationId = user.registrationId;
  const box = await GuidanceBox.findOne({ registrationId });
  if (!box) {
    const data = [];
    res.status(200).json({
      status: "success",
      message: data,
    });
  } else {
    res.status(200).json({
      status: "success",
      message: box,
    });
  }
});
