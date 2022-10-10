const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const AddCourse = require("../models/AddCourseModel");
const SOS = require("../models/SchemeOfStudyModel");
const Student = require("../models/StudentModel");
const PendingAddCourse = require("../models/pendingAddCourseModel");
const ElectiveCourse = require("../models/ElectiveCoursesModel");
const BA_Notification = require("../models/BA_NotificationModel");
const S_Notification = require("../models/S_NotificationsModel");
const ApprovedRequest = require("../models/ApprovedRequestModel");
const cloudinary = require("../utils/Clodinrary");

//-------------------------ADD COURSE------------------------
// on student side
// delete the course that add-------------student side
exports.DeleteAddCourseRequest = catchAsync(async (req, res, next) => {
  const { courseName } = req.body;
  const user = req.rootuser;
  const { registrationId } = user;
  const record = await AddCourse.findOne({ registrationId: registrationId });
  if (!record) {
    return next(new AppError("No Record Found", 400));
  } else {
    for (let i = 0; i < record.courses.length; i++) {
      if (record.courses[i].courseName === courseName) {
        await record.courses.splice(i, 1);
        await record.save();
        res.status(200).json({
          status: "success",
          message: "Deleted Successfully",
        });
        // res.send("deleted");
      }
    }
    if (record.courses.length === 0) {
      await record.delete();
      res.status(200).json({
        status: "success",
        message: "Delete Successfully",
      });
    }
  }
});
//-----------------courses that student can add--------------
// 1. get all courses of student & SOS
// 2. check courses that student drop or withdraw
// 3.check prerequsite that drop or withdraw
// 4. check courses that have gpa less than 2
// 5.remove courses that student repeat and less marks course remove
// 6.check pre requsite in which fail
// 7. // remove courses that student current enrolled or Add Pending or drop pending
exports.courses_that_added = catchAsync(async (req, res) => {
  const student = req.rootuser;
  const { semester, registrationId } = student;
  if (semester === 1) {
    const courses = [];
    res.status(200).json({
      status: "success",
      message: courses,
    });
  } else if (semester === 2) {
    const semes1 = 1;
    const semes2 = 2;
    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const sos_courses = semester1.concat(semester2);
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_courses = std_sems1.concat(std_sems2);
    // check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    // console.log(sos_courses);
    // check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    // check courses that have gpa less tha 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }

    // remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }

    // check prerequsite in which they fail

    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length !== 0) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    // concat and display all courses that student add
    const courses = sos_courses.concat(data1);
    // remove courses that student current enrolled or Add Pending or drop pending
    for (let i = 0; i < std_sems2.length; i++) {
      for (let j = 0; j < courses.length; j++) {
        if (std_sems2[i].courseName === courses[j].courseName) {
          await courses.splice(j, 1);
        }
      }
    }
    //courses that are in pendingAddcourse that also remove from courses
    const pending = await PendingAddCourse.findOne({ registrationId });
    if (!pending) {
      res.status(200).json({
        status: "success",
        message: courses,
      });
    } else {
      for (let i = 0; i < courses.length; i++) {
        for (let j = 0; j < pending.courses.length; j++) {
          if (courses[i].courseName === pending.courses[j].courseName) {
            await courses.splice(i, 1);
          }
        }
      }
      res.status(200).json({
        status: "success",
        message: courses,
      });
    }
  } else if (semester === 3) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const sos_courses = semester1.concat(semester2, semester3);

    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_courses = std_sems1.concat(std_sems2, std_sems3);
    //courses that student drop aur withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //courses that have gpa less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //check prerequsite in which they are fail
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length !== 0) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //concat and display all courses that can be add
    const courses = sos_courses.concat(data1);
    // remove courses that student current enrolled or Add Pending
    for (let i = 0; i < std_sems3.length; i++) {
      for (let j = 0; j < courses.length; j++) {
        if (std_sems3[i].courseName === courses[j].courseName) {
          await courses.splice(j, 1);
        }
      }
    }
    //courses that are in pendingAddcourse that also remove from courses
    const pending = await PendingAddCourse.findOne({ registrationId });
    if (!pending) {
      res.status(200).json({
        status: "success",
        message: courses,
      });
    } else {
      for (let i = 0; i < courses.length; i++) {
        for (let j = 0; j < pending.courses.length; j++) {
          if (courses[i].courseName === pending.courses[j].courseName) {
            await courses.splice(i, 1);
          }
        }
      }
      res.status(200).json({
        status: "success",
        message: courses,
      });
    }
  } else if (semester === 4) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const sos_courses = semester1.concat(semester2, semester3, semester4);

    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_courses = std_sems1.concat(std_sems2, std_sems3, std_sems4);
    //check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //check prerequsite
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length !== 0) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //concat and display courses than can add
    const courses = sos_courses.concat(data1);

    // remove courses that student current enrolled or Add Pending
    for (let i = 0; i < std_sems4.length; i++) {
      for (let j = 0; j < courses.length; j++) {
        if (std_sems4[i].courseName === courses[j].courseName) {
          await courses.splice(j, 1);
        }
      }
    }
    //courses that are in pendingAddcourse that also remove from courses
    const pending = await PendingAddCourse.findOne({ registrationId });
    if (!pending) {
      res.status(200).json({
        status: "success",
        message: courses,
      });
    } else {
      for (let i = 0; i < courses.length; i++) {
        for (let j = 0; j < pending.courses.length; j++) {
          if (courses[i].courseName === pending.courses[j].courseName) {
            await courses.splice(i, 1);
          }
        }
      }
      res.status(200).json({
        status: "success",
        message: courses,
      });
    }
  } else if (semester === 5) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semes5 = 5;
    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const semester5 = await SOS.find({ semester: semes5 });
    const sos_courses = semester1.concat(
      semester2,
      semester3,
      semester4,
      semester5
    );
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_sems5 = req.rootuserSemester5;
    const std_courses = std_sems1.concat(
      std_sems2,
      std_sems3,
      std_sems4,
      std_sems5
    );
    //check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //remove names of elective from sos
    for (let i = 0; i < sos_courses.length; i++) {
      if (sos_courses[i].courseCode === "--") {
        await sos_courses.splice(i, 1);
        i--;
      }
    }
    // clear prerequisite in which student fail
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length !== 0) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //elective courses
    const elective = await ElectiveCourse.find();
    let elec = 0;
    for (let i = 0; i < std_sems5.length; i++) {
      for (let j = 0; j < elective.length; j++) {
        if (std_sems5[i].courseName === elective[j].courseName) {
          elec = elec + 1;
        }
      }
    }
    //concat and display all courses that student add
    if (elec === 0) {
      //clear prerequisite for elective cources
      for (let i = 0; i < elective.length; i++) {
        for (let j = 0; j < std_courses.length; j++) {
          if (elective[i].prerequisite.length === 1) {
            if (
              elective[i].prerequisite[0].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          } else if (elective[i].prerequisite.length === 2) {
            if (
              elective[i].prerequisite[0].course ===
                std_courses[j].courseCode ||
              elective[i].prerequisite[1].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      const courses = sos_courses.concat(data1, elective);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems5.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems5[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    } else {
      const courses = sos_courses.concat(data1);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems5.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems5[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    }
  } else if (semester === 6) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semes5 = 5;
    const semes6 = 6;
    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const semester5 = await SOS.find({ semester: semes5 });
    const semester6 = await SOS.find({ semester: semes6 });

    const sos_courses = semester1.concat(
      semester2,
      semester3,
      semester4,
      semester5,
      semester6
    );
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_sems5 = req.rootuserSemester5;
    const std_sems6 = req.rootuserSemester6;

    const std_courses = std_sems1.concat(
      std_sems2,
      std_sems3,
      std_sems4,
      std_sems5,
      std_sems6
    );
    //check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //remove names of elective from sos
    for (let i = 0; i < sos_courses.length; i++) {
      if (sos_courses[i].courseCode === "--") {
        await sos_courses.splice(i, 1);
        i--;
      }
    }
    //clear prerequisite in which student fail
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //elective courses
    const elective = await ElectiveCourse.find();
    let elec = 0;
    const std_sems = std_sems5.concat(std_sems6);
    for (let i = 0; i < std_sems.length; i++) {
      for (let j = 0; j < elective.length; j++) {
        if (std_sems[i].courseName === elective[j].courseName) {
          await elective.splice[(j, 1)];
          elec = elec + 1;
        }
      }
    }
    //concat and display all courses that student add
    if (elec === 3) {
      const courses = sos_courses.concat(data1);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems6.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems6[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    } else {
      //clear prerequisite for elective cources
      for (let i = 0; i < elective.length; i++) {
        for (let j = 0; j < std_courses.length; j++) {
          if (elective[i].prerequisite.length === 1) {
            if (
              elective[i].prerequisite[0].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          } else if (elective[i].prerequisite.length === 2) {
            if (
              elective[i].prerequisite[0].course ===
                std_courses[j].courseCode ||
              elective[i].prerequisite[1].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      const courses = sos_courses.concat(data1, elective);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems6.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems6[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    }
  } else if (semester === 7) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semes5 = 5;
    const semes6 = 6;
    const semes7 = 7;

    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const semester5 = await SOS.find({ semester: semes5 });
    const semester6 = await SOS.find({ semester: semes6 });
    const semester7 = await SOS.find({ semester: semes7 });

    const sos_courses = semester1.concat(
      semester2,
      semester3,
      semester4,
      semester5,
      semester6,
      semester7
    );
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_sems5 = req.rootuserSemester5;
    const std_sems6 = req.rootuserSemester6;
    const std_sems7 = req.rootuserSemester7;

    const std_courses = std_sems1.concat(
      std_sems2,
      std_sems3,
      std_sems4,
      std_sems5,
      std_sems6,
      std_sems7
    );
    //check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //remove names of elective from sos
    for (let i = 0; i < sos_courses.length; i++) {
      if (sos_courses[i].courseCode === "--") {
        await sos_courses.splice(i, 1);
        i--;
      }
    }
    // clear prerequisite
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //elective courses
    const elective = await ElectiveCourse.find();
    let elec = 0;
    const std_sems = std_sems5.concat(std_sems6, std_sems7);
    for (let i = 0; i < std_sems.length; i++) {
      for (let j = 0; j < elective.length; j++) {
        if (std_sems[i].courseName === elective[j].courseName) {
          await elective.splice[(j, 1)];
          elec = elec + 1;
        }
      }
    }
    if (elec === 5) {
      const courses = sos_courses.concat(data1);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems7.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems7[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    } else {
      //clear prerequisite for elective cources
      for (let i = 0; i < elective.length; i++) {
        for (let j = 0; j < std_courses.length; j++) {
          if (elective[i].prerequisite.length === 1) {
            if (
              elective[i].prerequisite[0].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          } else if (elective[i].prerequisite.length === 2) {
            if (
              elective[i].prerequisite[0].course ===
                std_courses[j].courseCode ||
              elective[i].prerequisite[1].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      const courses = sos_courses.concat(data1, elective);

      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems7.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems7[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    }
  } else if (semester === 8) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semes5 = 5;
    const semes6 = 6;
    const semes7 = 7;
    const semes8 = 8;

    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const semester5 = await SOS.find({ semester: semes5 });
    const semester6 = await SOS.find({ semester: semes6 });
    const semester7 = await SOS.find({ semester: semes7 });
    const semester8 = await SOS.find({ semester: semes8 });

    const sos_courses = semester1.concat(
      semester2,
      semester3,
      semester4,
      semester5,
      semester6,
      semester7,
      semester8
    );
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_sems5 = req.rootuserSemester5;
    const std_sems6 = req.rootuserSemester6;
    const std_sems7 = req.rootuserSemester7;
    const std_sems8 = req.rootuserSemester8;

    const std_courses = std_sems1.concat(
      std_sems2,
      std_sems3,
      std_sems4,
      std_sems5,
      std_sems6,
      std_sems7,
      std_sems8
    );
    // check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //remove names of elective from sos
    for (let i = 0; i < sos_courses.length; i++) {
      if (sos_courses[i].courseCode === "--") {
        await sos_courses.splice(i, 1);
        i--;
      }
    }
    // clear prerequisite
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //elective courses
    const elective = await ElectiveCourse.find();
    let elec = 0;
    const std_sems = std_sems5.concat(std_sems6, std_sems7, std_sems8);
    for (let i = 0; i < std_sems.length; i++) {
      for (let j = 0; j < elective.length; j++) {
        if (std_sems[i].courseName === elective[j].courseName) {
          await elective.splice[(j, 1)];
          elec = elec + 1;
        }
      }
    }

    if (elec === 5) {
      const courses = sos_courses.concat(data1);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems8.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems8[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    } else {
      //clear prerequisite for elective cources
      for (let i = 0; i < elective.length; i++) {
        for (let j = 0; j < std_courses.length; j++) {
          if (elective[i].prerequisite.length === 1) {
            if (
              elective[i].prerequisite[0].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          } else if (elective[i].prerequisite.length === 2) {
            if (
              elective[i].prerequisite[0].course ===
                std_courses[j].courseCode ||
              elective[i].prerequisite[1].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      const courses = sos_courses.concat(data1, elective);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems8.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems8[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    }
  } else if (semester === 9) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semes5 = 5;
    const semes6 = 6;
    const semes7 = 7;
    const semes8 = 8;

    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const semester5 = await SOS.find({ semester: semes5 });
    const semester6 = await SOS.find({ semester: semes6 });
    const semester7 = await SOS.find({ semester: semes7 });
    const semester8 = await SOS.find({ semester: semes8 });

    const sos_courses = semester1.concat(
      semester2,
      semester3,
      semester4,
      semester5,
      semester6,
      semester7,
      semester8
    );
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_sems5 = req.rootuserSemester5;
    const std_sems6 = req.rootuserSemester6;
    const std_sems7 = req.rootuserSemester7;
    const std_sems8 = req.rootuserSemester8;
    const std_sems9 = req.rootuserSemester9;

    const std_courses = std_sems1.concat(
      std_sems2,
      std_sems3,
      std_sems4,
      std_sems5,
      std_sems6,
      std_sems7,
      std_sems8,
      std_sems9
    );
    //check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //remove names of elective from sos
    for (let i = 0; i < sos_courses.length; i++) {
      if (sos_courses[i].courseCode === "--") {
        await sos_courses.splice(i, 1);
        i--;
      }
    }
    //clear prerequisite
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //elective courses
    const elective = await ElectiveCourse.find();
    let elec = 0;
    const std_sems = std_sems5.concat(
      std_sems6,
      std_sems7,
      std_sems8,
      std_sems9
    );
    for (let i = 0; i < std_sems.length; i++) {
      for (let j = 0; j < elective.length; j++) {
        if (std_sems[i].courseName === elective[j].courseName) {
          await elective.splice[(j, 1)];
          elec = elec + 1;
        }
      }
    }
    if (elec === 5) {
      const courses = sos_courses.concat(data1);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems9.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems9[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    } else {
      //clear prerequisite for elective cources
      for (let i = 0; i < elective.length; i++) {
        for (let j = 0; j < std_courses.length; j++) {
          if (elective[i].prerequisite.length === 1) {
            if (
              elective[i].prerequisite[0].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          } else if (elective[i].prerequisite.length === 2) {
            if (
              elective[i].prerequisite[0].course ===
                std_courses[j].courseCode ||
              elective[i].prerequisite[1].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      const courses = sos_courses.concat(data1, elective);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems9.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems9[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    }
  } else if (semester === 10) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semes5 = 5;
    const semes6 = 6;
    const semes7 = 7;
    const semes8 = 8;

    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const semester5 = await SOS.find({ semester: semes5 });
    const semester6 = await SOS.find({ semester: semes6 });
    const semester7 = await SOS.find({ semester: semes7 });
    const semester8 = await SOS.find({ semester: semes8 });

    const sos_courses = semester1.concat(
      semester2,
      semester3,
      semester4,
      semester5,
      semester6,
      semester7,
      semester8
    );
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_sems5 = req.rootuserSemester5;
    const std_sems6 = req.rootuserSemester6;
    const std_sems7 = req.rootuserSemester7;
    const std_sems8 = req.rootuserSemester8;
    const std_sems9 = req.rootuserSemester9;
    const std_sems10 = req.rootuserSemester10;

    const std_courses = std_sems1.concat(
      std_sems2,
      std_sems3,
      std_sems4,
      std_sems5,
      std_sems6,
      std_sems7,
      std_sems8,
      std_sems9,
      std_sems10
    );
    //check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //remove names of elective from sos
    for (let i = 0; i < sos_courses.length; i++) {
      if (sos_courses[i].courseCode === "--") {
        await sos_courses.splice(i, 1);
        i--;
      }
    }
    //clear prerequisite
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //elective courses
    const elective = await ElectiveCourse.find();
    let elec = 0;
    const std_sems = std_sems5.concat(
      std_sems6,
      std_sems7,
      std_sems8,
      std_sems9,
      std_sems10
    );
    for (let i = 0; i < std_sems.length; i++) {
      for (let j = 0; j < elective.length; j++) {
        if (std_sems[i].courseName === elective[j].courseName) {
          await elective.splice[(j, 1)];
          elec = elec + 1;
        }
      }
    }
    if (elec === 5) {
      const courses = sos_courses.concat(data1);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems10.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems10[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    } else {
      //clear prerequisite for elective cources
      for (let i = 0; i < elective.length; i++) {
        for (let j = 0; j < std_courses.length; j++) {
          if (elective[i].prerequisite.length === 1) {
            if (
              elective[i].prerequisite[0].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          } else if (elective[i].prerequisite.length === 2) {
            if (
              elective[i].prerequisite[0].course ===
                std_courses[j].courseCode ||
              elective[i].prerequisite[1].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      const courses = sos_courses.concat(data1, elective);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems10.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems10[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    }
  } else if (semester === 11) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semes5 = 5;
    const semes6 = 6;
    const semes7 = 7;
    const semes8 = 8;

    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const semester5 = await SOS.find({ semester: semes5 });
    const semester6 = await SOS.find({ semester: semes6 });
    const semester7 = await SOS.find({ semester: semes7 });
    const semester8 = await SOS.find({ semester: semes8 });

    const sos_courses = semester1.concat(
      semester2,
      semester3,
      semester4,
      semester5,
      semester6,
      semester7,
      semester8
    );
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_sems5 = req.rootuserSemester5;
    const std_sems6 = req.rootuserSemester6;
    const std_sems7 = req.rootuserSemester7;
    const std_sems8 = req.rootuserSemester8;
    const std_sems9 = req.rootuserSemester9;
    const std_sems10 = req.rootuserSemester10;
    const std_sems11 = req.rootuserSemester11;

    const std_courses = std_sems1.concat(
      std_sems2,
      std_sems3,
      std_sems4,
      std_sems5,
      std_sems6,
      std_sems7,
      std_sems8,
      std_sems9,
      std_sems10,
      std_sems11
    );
    //check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //remove names of elective from sos
    for (let i = 0; i < sos_courses.length; i++) {
      if (sos_courses[i].courseCode === "--") {
        await sos_courses.splice(i, 1);
        i--;
      }
    }
    //clear prerequisite
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //elective courses
    const elective = await ElectiveCourse.find();
    let elec = 0;
    const std_sems = std_sems5.concat(
      std_sems6,
      std_sems7,
      std_sems8,
      std_sems9,
      std_sems10,
      std_sems11
    );
    for (let i = 0; i < std_sems.length; i++) {
      for (let j = 0; j < elective.length; j++) {
        if (std_sems[i].courseName === elective[j].courseName) {
          await elective.splice[(j, 1)];
          elec = elec + 1;
        }
      }
    }
    if (elec === 5) {
      const courses = sos_courses.concat(data1);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems11.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems11[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    } else {
      //clear prerequisite for elective cources
      for (let i = 0; i < elective.length; i++) {
        for (let j = 0; j < std_courses.length; j++) {
          if (elective[i].prerequisite.length === 1) {
            if (
              elective[i].prerequisite[0].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          } else if (elective[i].prerequisite.length === 2) {
            if (
              elective[i].prerequisite[0].course ===
                std_courses[j].courseCode ||
              elective[i].prerequisite[1].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      const courses = sos_courses.concat(data1, elective);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems11.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems11[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    }
  } else if (semester === 12) {
    const semes1 = 1;
    const semes2 = 2;
    const semes3 = 3;
    const semes4 = 4;
    const semes5 = 5;
    const semes6 = 6;
    const semes7 = 7;
    const semes8 = 8;

    const semester1 = await SOS.find({ semester: semes1 });
    const semester2 = await SOS.find({ semester: semes2 });
    const semester3 = await SOS.find({ semester: semes3 });
    const semester4 = await SOS.find({ semester: semes4 });
    const semester5 = await SOS.find({ semester: semes5 });
    const semester6 = await SOS.find({ semester: semes6 });
    const semester7 = await SOS.find({ semester: semes7 });
    const semester8 = await SOS.find({ semester: semes8 });

    const sos_courses = semester1.concat(
      semester2,
      semester3,
      semester4,
      semester5,
      semester6,
      semester7,
      semester8
    );
    const std_sems1 = req.rootuserSemester1;
    const std_sems2 = req.rootuserSemester2;
    const std_sems3 = req.rootuserSemester3;
    const std_sems4 = req.rootuserSemester4;
    const std_sems5 = req.rootuserSemester5;
    const std_sems6 = req.rootuserSemester6;
    const std_sems7 = req.rootuserSemester7;
    const std_sems8 = req.rootuserSemester8;
    const std_sems9 = req.rootuserSemester9;
    const std_sems10 = req.rootuserSemester10;
    const std_sems11 = req.rootuserSemester11;
    const std_sems12 = req.rootuserSemester12;

    const std_courses = std_sems1.concat(
      std_sems2,
      std_sems3,
      std_sems4,
      std_sems5,
      std_sems6,
      std_sems7,
      std_sems8,
      std_sems9,
      std_sems10,
      std_sems11,
      std_sems12
    );
    //check courses that student drop or withdraw
    for (let i = 0; i < std_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[j].courseName === std_courses[i].courseName) {
          await sos_courses.splice(j, 1);
        }
      }
    }
    //check prerequsite which they drop or withdraw
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < sos_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              sos_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === sos_courses[j].courseCode
          ) {
            await sos_courses.splice(i, 1);
            i--;
          }
        }
      }
    }
    //check courses that gp is less than 2
    let data1 = [];
    for (let i = 0; i < std_courses.length; i++) {
      if (std_courses[i].gp < 2) {
        console.log(i);
        await data1.push(std_courses[i]);
      }
    }
    //remove courses that student repeat and less marks course remove
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (data1[i].courseCode === std_courses[j].courseCode) {
          if (data1[i].marks != std_courses[j].marks) {
            console.log(data1[i].courseName);
            if (data1[i].marks < std_courses[j].marks) {
              await data1.splice(i, 1);
            }
          }
        }
      }
    }
    //remove names of elective from sos
    for (let i = 0; i < sos_courses.length; i++) {
      if (sos_courses[i].courseCode === "--") {
        await sos_courses.splice(i, 1);
        i--;
      }
    }
    //clear prerequisite
    for (let i = 0; i < sos_courses.length; i++) {
      for (let j = 0; j < std_courses.length; j++) {
        if (sos_courses[i].prerequisite.length === 1) {
          if (
            sos_courses[i].prerequisite[0].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 2) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 3) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        } else if (sos_courses[i].prerequisite.length === 4) {
          if (
            sos_courses[i].prerequisite[0].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[1].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[2].course ===
              std_courses[j].courseCode ||
            sos_courses[i].prerequisite[3].course === std_courses[j].courseCode
          ) {
            if (std_courses[j].gp < 1.3) {
              await sos_courses.splice(i, 1);
              i--;
            }
          }
        }
      }
    }
    //elective courses
    const elective = await ElectiveCourse.find();
    let elec = 0;
    const std_sems = std_sems5.concat(
      std_sems6,
      std_sems7,
      std_sems8,
      std_sems9,
      std_sems10,
      std_sems11,
      std_sems12
    );
    for (let i = 0; i < std_sems.length; i++) {
      for (let j = 0; j < elective.length; j++) {
        if (std_sems[i].courseName === elective[j].courseName) {
          await elective.splice[(j, 1)];
          elec = elec + 1;
        }
      }
    }
    if (elec === 5) {
      const courses = sos_courses.concat(data1);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems12.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems12[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      //courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    } else {
      //clear prerequisite for elective cources
      for (let i = 0; i < elective.length; i++) {
        for (let j = 0; j < std_courses.length; j++) {
          if (elective[i].prerequisite.length === 1) {
            if (
              elective[i].prerequisite[0].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          } else if (elective[i].prerequisite.length === 2) {
            if (
              elective[i].prerequisite[0].course ===
                std_courses[j].courseCode ||
              elective[i].prerequisite[1].course === std_courses[j].courseCode
            ) {
              if (std_courses[j].gp < 1.3) {
                await elective.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      const courses = sos_courses.concat(data1, elective);
      // remove courses that student current enrolled or Add Pending
      for (let i = 0; i < std_sems12.length; i++) {
        for (let j = 0; j < courses.length; j++) {
          if (std_sems12[i].courseName === courses[j].courseName) {
            await courses.splice(j, 1);
          }
        }
      }
      // courses that are in pendingAddcourse that also remove from courses
      const pending = await PendingAddCourse.findOne({ registrationId });
      if (!pending) {
        res.status(200).json({
          status: "success",
          message: courses,
        });
      } else {
        for (let i = 0; i < courses.length; i++) {
          for (let j = 0; j < pending.courses.length; j++) {
            if (courses[i].courseName === pending.courses[j].courseName) {
              await courses.splice(i, 1);
            }
          }
        }
        res.status(200).json({
          status: "success",
          message: courses,
        });
      }
    }
  }
});
// for add course get  creidts hours
exports.CreditHours = catchAsync(async (req, res, next) => {
  const student = req.rootuser;
  const { registrationId, semester } = student;
  const data = await Student.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
    // res.status(400).send("no record found");
  } else {
    if (semester === 1) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester1.length; i++) {
        credit += data.Result[0].Semester1[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 2) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester2.length; i++) {
        credit += data.Result[0].Semester2[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 3) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester3.length; i++) {
        credit += data.Result[0].Semester3[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 4) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester4.length; i++) {
        credit += data.Result[0].Semester4[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 5) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester5.length; i++) {
        credit += data.Result[0].Semester5[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 6) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester6.length; i++) {
        credit += data.Result[0].Semester6[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 7) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester7.length; i++) {
        credit += data.Result[0].Semester7[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 8) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester8.length; i++) {
        credit += data.Result[0].Semester8[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 9) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester9.length; i++) {
        credit += data.Result[0].Semester9[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 10) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester10.length; i++) {
        credit += data.Result[0].Semester10[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 11) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester11.length; i++) {
        credit += data.Result[0].Semester11[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    } else if (semester === 12) {
      let credit = 0;
      for (let i = 0; i < data.Result[0].Semester12.length; i++) {
        credit += data.Result[0].Semester12[i].credits;
      }
      const data1 = await PendingAddCourse.findOne({ registrationId });
      if (data1) {
        for (let i = 0; i < data1.courses.length; i++) {
          credit += data1.courses[i].credits;
        }
      }
      res.status(200).json({
        status: "success",
        message: credit,
      });
      // res.json(credit);
    }
  }
});
// reject Add course course BatchAdvisor
exports.DeleteAddPending = catchAsync(async (req, res, next) => {
  const { courseName, registrationId } = req.body;
  const { name } = req.rootuser;
  const data = await AddCourse.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Course Found", 400));
  } else {
    for (let i = 0; i < data.courses.length; i++) {
      if (courseName === data.courses[i].courseName) {
        await data.courses.splice(i, 1);
        if (data.courses.length === 0) {
          await data.delete();
        } else {
          await data.save();
        }
        const data1 = await Student.findOne({ registrationId });
        if (!data1) {
          return next(new AppError("No student found for drop course", 400));
        } else {
          if (data1.semester === 1) {
            for (let j = 0; j < data1.Result[0].Semester1.length; j++) {
              if (data1.Result[0].Semester1[j].courseName === courseName) {
                data1.Result[0].Semester1.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 2) {
            for (let j = 0; j < data1.Result[0].Semester2.length; j++) {
              if (data1.Result[0].Semester2[j].courseName === courseName) {
                data1.Result[0].Semester2.splice(j, 1);
                await data1.save();
                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 3) {
            for (let j = 0; j < data1.Result[0].Semester3.length; j++) {
              if (data1.Result[0].Semester3[j].courseName === courseName) {
                data1.Result[0].Semester3.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 4) {
            for (let j = 0; j < data1.Result[0].Semester4.length; j++) {
              if (data1.Result[0].Semester4[j].courseName === courseName) {
                data1.Result[0].Semester4.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 5) {
            for (let j = 0; j < data1.Result[0].Semester5.length; j++) {
              if (data1.Result[0].Semester5[j].courseName === courseName) {
                data1.Result[0].Semester5.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 6) {
            for (let j = 0; j < data1.Result[0].Semester6.length; j++) {
              if (data1.Result[0].Semester6[j].courseName === courseName) {
                data1.Result[0].Semester6.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 7) {
            for (let j = 0; j < data1.Result[0].Semester7.length; j++) {
              if (data1.Result[0].Semester7[j].courseName === courseName) {
                data1.Result[0].Semester7.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 8) {
            for (let j = 0; j < data1.Result[0].Semester8.length; j++) {
              if (data1.Result[0].Semester8[j].courseName === courseName) {
                data1.Result[0].Semester8.splice(j, 1);
                await data1.save();
                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 9) {
            for (let j = 0; j < data1.Result[0].Semester9.length; j++) {
              if (data1.Result[0].Semester9[j].courseName === courseName) {
                data1.Result[0].Semester9.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 10) {
            for (let j = 0; j < data1.Result[0].Semester10.length; j++) {
              if (data1.Result[0].Semester10[j].courseName === courseName) {
                data1.Result[0].Semester10.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 11) {
            for (let j = 0; j < data1.Result[0].Semester11.length; j++) {
              if (data1.Result[0].Semester11[j].courseName === courseName) {
                data1.Result[0].Semester11.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          } else if (data1.semester === 12) {
            for (let j = 0; j < data1.Result[0].Semester12.length; j++) {
              if (data1.Result[0].Semester12[j].courseName === courseName) {
                // console.log(data1.Result[0].Semester8[j].status);
                data1.Result[0].Semester12.splice(j, 1);
                await data1.save();

                // notifications
                const N_message = `has rejected your request to add ${courseName} course.`;
                const addNotification = await S_Notification.findOne({
                  registrationId,
                });
                if (!addNotification) {
                  const addNoti = new S_Notification({
                    registrationId,
                  });
                  await addNoti.notifi(name, N_message);
                  await addNoti.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!..",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Delete Course Successfully!...",
                  });
                }
              }
            }
          }
        }
      }
    }
  }
});
// submit add form requests
exports.AddCoursesSubmit = catchAsync(async (req, res) => {
  const { registrationId } = req.body;
  const { name } = req.rootuser;
  const data = await AddCourse.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
  } else {
    const data1 = await Student.findOne({ registrationId });
    if (data1.semester === 1) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester1.length; i++) {
        if (data1.Result[0].Semester1[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester1[i].courseName,
            courseCode: data1.Result[0].Semester1[i].courseCode,
            credits: data1.Result[0].Semester1[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester1[i].courseName);
          await record.save();
          data1.Result[0].Semester1[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 2) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester2.length; i++) {
        if (data1.Result[0].Semester2[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester2[i].courseName,
            courseCode: data1.Result[0].Semester2[i].courseCode,
            credits: data1.Result[0].Semester2[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester2[i].courseName);
          await record.save();
          data1.Result[0].Semester2[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 3) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester3.length; i++) {
        if (data1.Result[0].Semester3[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester3[i].courseName,
            courseCode: data1.Result[0].Semester3[i].courseCode,
            credits: data1.Result[0].Semester3[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester3[i].courseName);
          await record.save();
          data1.Result[0].Semester3[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 4) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester4.length; i++) {
        if (data1.Result[0].Semester4[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester4[i].courseName,
            courseCode: data1.Result[0].Semester4[i].courseCode,
            credits: data1.Result[0].Semester4[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester4[i].courseName);
          await record.save();
          data1.Result[0].Semester4[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      data1.Result[0].Semester3[i].courseName;
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 5) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester5.length; i++) {
        if (data1.Result[0].Semester5[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester5[i].courseName,
            courseCode: data1.Result[0].Semester5[i].courseCode,
            credits: data1.Result[0].Semester5[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester5[i].courseName);
          await record.save();
          data1.Result[0].Semester5[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 6) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester6.length; i++) {
        if (data1.Result[0].Semester6[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester6[i].courseName,
            courseCode: data1.Result[0].Semester6[i].courseCode,
            credits: data1.Result[0].Semester6[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester6[i].courseName);
          await record.save();
          data1.Result[0].Semester6[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 7) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester7.length; i++) {
        if (data1.Result[0].Semester7[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester7[i].courseName,
            courseCode: data1.Result[0].Semester7[i].courseCode,
            credits: data1.Result[0].Semester7[i].credits,
            section: data1.section,
            semester: data1.semester,
            action: action,
          });
          course.push(data1.Result[0].Semester7[i].courseName);
          await record.save();
          data1.Result[0].Semester7[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 8) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester8.length; i++) {
        if (data1.Result[0].Semester8[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester8[i].courseName,
            courseCode: data1.Result[0].Semester8[i].courseCode,
            credits: data1.Result[0].Semester8[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester8[i].courseName);
          await record.save();
          data1.Result[0].Semester8[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 9) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester9.length; i++) {
        if (data1.Result[0].Semester9[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester9[i].courseName,
            courseCode: data1.Result[0].Semester9[i].courseCode,
            credits: data1.Result[0].Semester9[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester9[i].courseName);
          await record.save();
          data1.Result[0].Semester9[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 10) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester10.length; i++) {
        if (data1.Result[0].Semester10[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester10[i].courseName,
            courseCode: data1.Result[0].Semester10[i].courseCode,
            credits: data1.Result[0].Semester10[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester10[i].courseName);
          await record.save();
          data1.Result[0].Semester10[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 11) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester11.length; i++) {
        if (data1.Result[0].Semester11[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester11[i].courseName,
            courseCode: data1.Result[0].Semester11[i].courseCode,
            credits: data1.Result[0].Semester11[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester11[i].courseName);
          await record.save();
          data1.Result[0].Semester11[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    } else if (data1.semester === 12) {
      let course = [];
      for (let i = 0; i < data1.Result[0].Semester12.length; i++) {
        if (data1.Result[0].Semester12[i].status === "Add Pending") {
          const action = "Add Course";
          const record = new ApprovedRequest({
            registrationId: registrationId,
            name: data1.name,
            courseName: data1.Result[0].Semester12[i].courseName,
            courseCode: data1.Result[0].Semester12[i].courseCode,
            credits: data1.Result[0].Semester12[i].credits,
            section: data1.section,
            action: action,
            semester: data1.semester,
          });
          course.push(data1.Result[0].Semester12[i].courseName);
          await record.save();
          data1.Result[0].Semester12[i].status = "enrolled";
          await data1.save();
        }
      }
      await data.delete();
      // notifications
      let N_message = "";
      if (course.length === 1) {
        N_message = `has accepted your request to add ${course[0]} course.`;
      }
      if (course.length === 2) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]} course.`;
      }
      if (course.length === 3) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]} course.`;
      }
      if (course.length === 4) {
        N_message = `has accepted your request to add ${course[0]}, ${course[1]}, ${course[2]}, ${course[3]} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      if (!addNotification) {
        const addNoti = new S_Notification({
          registrationId,
        });
        await addNoti.notifi(name, N_message);
        await addNoti.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!..",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Send Successfully!...",
        });
      }
    }
  }
  //ok kerna per is student ka from ma jitna record sab khatam aur student ma drop pendeing student sa deletee ho jai ho jai status
  //mailsend ho jai form k
});
// submit button student side
exports.SubmitAddForm = catchAsync(async (req, res, next) => {
  const student = req.rootuser;
  const {
    batch,
    registrationId,
    semester,
    name,
    email,
    section,
    address,
    request,
    contactNo,
    batchAdvisorName,
  } = student;
  const { CGPA } = student.Result[0];
  let courses = [];
  let N_course = [];
  const addcourses = await PendingAddCourse.findOne({ registrationId });
  if (!addcourses) {
    return next(new AppError("Do Not have any course to add", 400));
  } else {
    for (let i = 0; i < addcourses.courses.length; i++) {
      courses.push({
        courseCode: addcourses.courses[i].courseCode,
        courseName: addcourses.courses[i].courseName,
        credits: addcourses.courses[i].credits,
        courseSection: addcourses.courses[i].section,
        preTest: addcourses.courses[i].preTest,
        preReqCourse: addcourses.courses[i].preReqCourse,
        reason: addcourses.courses[i].reason,
      });
      N_course.push({ courseName: addcourses.courses[i].courseName });
    }
    const result = await cloudinary.uploader.upload(req.file.path);
    const fee = result.secure_url;
    let message = "";
    const data = await AddCourse.findOne({ registrationId });
    if (!data || data === false) {
      const add = new AddCourse({
        fee,
        batch,
        registrationId,
        semester,
        name,
        email,
        section,
        address,
        request,
        contactNo,
        CGPA,
      });
      for (let i = 0; i < courses.length; i++) {
        await add.add_course(
          courses[i].courseName,
          courses[i].courseCode,
          courses[i].credits,
          courses[i].courseSection,
          courses[i].preTest,
          courses[i].reason
        );
        await add.save();
      }
      //add in student record
      const student = await Student.findOne({ registrationId });
      if (student.semester === 1) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester1.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 2) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester2.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 3) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester3.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
        // res.send(student);
      } else if (student.semester === 4) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester4.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 5) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester5.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 6) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester6.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 7) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester7.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 8) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester8.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 9) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester9.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 10) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester10.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 11) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester11.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 12) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester12.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      }
    } else {
      data.fee = fee;
      for (let i = 0; i < courses.length; i++) {
        await data.add_course(
          courses[i].courseName,
          courses[i].courseCode,
          courses[i].credits,
          courses[i].courseSection,
          courses[i].preTest,
          courses[i].reason
        );
        await data.save();
      }
      const student = await Student.findOne({ registrationId });
      if (student.semester === 1) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester1.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        let message = "";
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 2) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester2.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 3) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester3.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 4) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester4.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 5) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester5.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 6) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester6.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 7) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester7.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 8) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester8.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 9) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester9.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 10) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester10.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 11) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester11.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      } else if (student.semester === 12) {
        for (let i = 0; i < courses.length; i++) {
          await student.Result[0].Semester12.push({
            courseName: courses[i].courseName,
            courseCode: courses[i].courseCode,
            credits: courses[i].credits,
            courseSection: courses[i].courseSection,
            marks: 0,
            // gp: 0,
            status: "Add Pending",
          });
        }
        await student.save();
        //remove courses from pending add course
        await addcourses.delete();
        // for notification
        if (N_course.length === 1) {
          message = `has sent a request to add ${N_course[0].courseName} course.`;
        } else if (N_course.length === 2) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} course.`;
        } else if (N_course.length === 3) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} course.`;
        } else if (N_course.length === 4) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} course.`;
        } else if (N_course.length === 5) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} course.`;
        } else if (N_course.length === 6) {
          message = `has sent a request to add ${N_course[0].courseName} , ${N_course[1].courseName} , ${N_course[2].courseName} , ${N_course[3].courseName} , ${N_course[4].courseName} , ${N_course[5].courseName} course.`;
        }
        const addNotification = await BA_Notification.findOne({
          name: batchAdvisorName,
        });
        if (!addNotification) {
          const addNoti = new BA_Notification({
            name: batchAdvisorName,
          });
          await addNoti.notifi(registrationId, message);
          await addNoti.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Add course request has been sent to the batch advisor.",
          });
        }
      }
    }
  }
});
//---------------------------------ADD FORM-------------------
exports.AddForm = catchAsync(async (req, res, next) => {
  const { registrationId } = req.params;
  const data = await AddCourse.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
  } else {
    res.status(200).json({
      status: "success",
      message: data,
    });
  }
});
