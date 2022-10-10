const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const CourseRequest = require("../models/DropCourseModel");
const BA_Notification = require("../models/BA_NotificationModel");
const S_Notification = require("../models/S_NotificationsModel");
const ApprovedRequest = require("../models/ApprovedRequestModel");
const Student = require("../models/StudentModel");

// Drop course request
exports.dropCourse_Request = catchAsync(async (req, res, next) => {
  const { reason, courseName } = req.body;
  const user = req.rootuser;
  const {
    name,
    email,
    contactNo,
    address,
    section,
    batch,
    semester,
    registrationId,
    batchAdvisorName,
  } = user;
  const CGPA = user.Result[0].CGPA;
  if (semester === 1) {
    const record = req.rootuserSemester1;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester1[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        batchAdvisorName; // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        //check that already course will be added or  not
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(
        new AppError(
          "First add some course and then drop ----your credits hours less",
          400
        )
      );
    }
  } else if (semester === 2) {
    const record = req.rootuserSemester2;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester2[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First  add some course and then drop", 400));
    }
  } else if (semester === 3) {
    const record = req.rootuserSemester3;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    //  console.log("first",cred)
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester3[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First add some course and then drop ", 400));
    }
  } else if (semester === 4) {
    const record = req.rootuserSemester4;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    //  console.log("first",cred)
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        console.log(i);
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester4[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First some course and then drop", 400));
    }
  } else if (semester === 5) {
    const record = req.rootuserSemester5;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    //  console.log("first",cred)
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester5[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First some course and then drop", 400));
    }
  } else if (semester === 6) {
    const record = req.rootuserSemester6;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    //  console.log("first",cred)
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester6[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First some course and then drop", 400));
    }
  } else if (semester === 7) {
    const record = req.rootuserSemester7;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    //  console.log("first",cred)
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester7[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First add some course and then drop", 400));
    }
  } else if (semester === 8) {
    const record = req.rootuserSemester8;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      console.log(i);
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester8[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First add some course and then drop", 400));
    }
  } else if (semester === 9) {
    const record = req.rootuserSemester9;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      console.log(i);
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester9[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First add some course and then drop", 400));
    }
  } else if (semester === 10) {
    const record = req.rootuserSemester10;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester10[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First add some course and then drop", 400));
    }
  } else if (semester === 11) {
    const record = req.rootuserSemester11;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester11[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First add some course and then drop", 400));
    }
  } else if (semester === 12) {
    const record = req.rootuserSemester12;
    var cred = 0;
    for (var i = 0; i < record.length; i++) {
      console.log(i);
      if (record[i].status === "enrolled") {
        cred += record[i].credits;
      }
    }
    if (cred >= 15) {
      var abc = "";
      for (var i = 0; i < record.length; i++) {
        if (record[i].courseName === courseName) {
          abc = i;
        }
      }
      const courseCode = record[abc].courseCode;
      const credits = record[abc].credits;
      user.Result[0].Semester12[abc].status = "Drop Pending";
      const box = await CourseRequest.findOne({ registrationId });
      if (!box) {
        const data = new CourseRequest({
          batch,
          registrationId,
          semester: semester,
          name: name,
          email: email,
          contactNo: contactNo,
          address: address,
          CGPA: CGPA,
          section: section,
        });
        await user.save();
        await data.save();
        await data.Courses1(courseCode, reason, courseName, credits);
        await data.save();
        // for notification
        const message = `has sent a request to Drop ${courseName} course.`;
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
            message: "Request Send Successfully",
          });
        } else {
          await addNotification.notifi(registrationId, message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Request Send Successfully",
          });
        }
      } else {
        var match = "";
        for (var i = 0; i < box.courses.length; i++) {
          if (box.courses[i].courseName === courseName) {
            match = i;
          }
        }
        if (match === "") {
          await user.save();
          await box.Courses1(courseCode, reason, courseName, credits);
          await box.save();
          // for notification
          const message = `has sent a request to Drop ${courseName} course.`;
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
              message: "Request Send Successfully",
            });
          } else {
            await addNotification.notifi(registrationId, message);
            await addNotification.save();
            res.status(200).json({
              status: "success",
              message: "Request Send Successfully",
            });
          }
        } else {
          return next(
            new AppError("this course request is already in pending", 400)
          );
        }
      }
    } else {
      return next(new AppError("First add some course and then drop", 400));
    }
  } else {
    return next(new AppError("You Do not registered in any semester", 400));
  }
});
//drop course form on ok
exports.dropcoursess = catchAsync(async (req, res, next) => {
  const { registrationId } = req.body;
  const { name } = req.rootuser;
  const data = await CourseRequest.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
  } else {
    let courseNotification = [];
    let N_message = "";
    const data1 = await Student.findOne({ registrationId });
    if (data.semester === 1) {
      for (var i = 0; i < data1.Result[0].Semester1.length; i++) {
        if (data1.Result[0].Semester1[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester1[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester1.splice(i, 1);
        }
        await data1.save();
        await data.delete();
        // notifications
        if (courseNotification.length === 1) {
          N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
        } else if (courseNotification.length === 2) {
          N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
        } else if (courseNotification.length === 2) {
          N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
        } else if (courseNotification.length === 3) {
          N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
            message: "Drop course request has been accepted successfuly.",
          });
        } else {
          await addNotification.notifi(name, N_message);
          await addNotification.save();
          res.status(200).json({
            status: "success",
            message: "Drop course request has been accepted successfuly.",
          });
        }
      }
    } else if (data.semester === 2) {
      for (var i = 0; i < data1.Result[0].Semester2.length; i++) {
        if (data1.Result[0].Semester2[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester2[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester2.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 3) {
      for (var i = 0; i < data1.Result[0].Semester3.length; i++) {
        if (data1.Result[0].Semester3[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester3[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester3.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 4) {
      for (var i = 0; i < data1.Result[0].Semester4.length; i++) {
        if (data1.Result[0].Semester4[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester4[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester4.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 5) {
      for (var i = 0; i < data1.Result[0].Semester5.length; i++) {
        if (data1.Result[0].Semester5[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester5[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester5.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 6) {
      for (var i = 0; i < data1.Result[0].Semester6.length; i++) {
        if (data1.Result[0].Semester6[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester6[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester6.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop Course Request Accept Successfully!...",
        });
      }
    } else if (data.semester === 7) {
      for (var i = 0; i < data1.Result[0].Semester7.length; i++) {
        if (data1.Result[0].Semester7[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester7[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester7.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 8) {
      for (var i = 0; i < data1.Result[0].Semester8.length; i++) {
        if (data1.Result[0].Semester8[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester8[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester8.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
      }
      const addNotification = await S_Notification.findOne({
        registrationId,
      });
      console.log(addNotification);
      if (!addNotification) {
        const addNotic = new S_Notification({
          registrationId,
        });
        await addNotic.notifi(name, N_message);
        await addNotic.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 9) {
      for (var i = 0; i < data1.Result[0].Semester9.length; i++) {
        if (data1.Result[0].Semester9[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester9[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester9.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 10) {
      for (var i = 0; i < data1.Result[0].Semester10.length; i++) {
        if (data1.Result[0].Semester10[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester10[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester10.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 11) {
      for (var i = 0; i < data1.Result[0].Semester11.length; i++) {
        if (data1.Result[0].Semester11[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester11[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester11.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else if (data.semester === 12) {
      for (var i = 0; i < data1.Result[0].Semester12.length; i++) {
        if (data1.Result[0].Semester12[i].status === "Drop Pending") {
          const action = "Drop Course";
          courseNotification.push({
            course: data1.Result[0].Semester12[i].courseName,
          });
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
          await record.save();
          await data1.Result[0].Semester12.splice(i, 1);
        }
      }
      await data1.save();
      await data.delete();
      // notifications
      if (courseNotification.length === 1) {
        N_message = `has accept your request to drop ${courseNotification[0].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 2) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} course.`;
      } else if (courseNotification.length === 3) {
        N_message = `has accept your request to drop ${courseNotification[0].course} , ${courseNotification[1].course} , ${courseNotification[2].course} course.`;
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
          message: "Drop course request has been accepted successfuly.",
        });
      } else {
        await addNotification.notifi(name, N_message);
        await addNotification.save();
        res.status(200).json({
          status: "success",
          message: "Drop course request has been accepted successfuly.",
        });
      }
    } else {
      return next(new AppError("You Do not registered in any semester", 400));
    }
  }
  //ok kerna per is student ka from ma jitna record sab khatam aur student ma drop pendeing student sa deletee ho jai ho jai status
  //mailsend ho jai form k
});
// reject drop course
exports.delete_DropRequest = catchAsync(async (req, res, next) => {
  const { courseName, registrationId } = req.body;
  const { name } = req.rootuser;
  const data = await CourseRequest.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
  } else {
    for (var i = 0; i < data.courses.length; i++) {
      if (courseName === data.courses[i].courseName) {
        await data.courses.splice(i, 1);
        await data.save();
        if (data.courses.length === 0) {
          await data.delete();
        }
        const data1 = await Student.findOne({ registrationId });
        if (!data1) {
          return next(new AppError("No Request Found for drop course", 400));
        } else {
          if (data.semester === 1) {
            for (var j = 0; j < data1.Result[0].Semester1.length; j++) {
              if (data1.Result[0].Semester1[j].courseName === courseName) {
                data1.Result[0].Semester1[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                }
              }
            }
          } else if (data.semester === 2) {
            for (var j = 0; j < data1.Result[0].Semester2.length; j++) {
              if (data1.Result[0].Semester2[j].courseName === courseName) {
                data1.Result[0].Semester2[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                }
              }
            }
          } else if (data.semester === 3) {
            for (var j = 0; j < data1.Result[0].Semester3.length; j++) {
              if (data1.Result[0].Semester3[j].courseName === courseName) {
                data1.Result[0].Semester3[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                }
              }
            }
          } else if (data.semester === 4) {
            for (var j = 0; j < data1.Result[0].Semester4.length; j++) {
              if (data1.Result[0].Semester4[j].courseName === courseName) {
                data1.Result[0].Semester4[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Drop Course Request Rejected Successfully!...",
                  });
                }
              }
            }
          } else if (data.semester === 5) {
            for (var j = 0; j < data1.Result[0].Semester5.length; j++) {
              if (data1.Result[0].Semester5[j].courseName === courseName) {
                data1.Result[0].Semester5[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Drop Course Request Rejected Successfully!...",
                  });
                }
              }
            }
          } else if (data.semester === 6) {
            for (var j = 0; j < data1.Result[0].Semester6.length; j++) {
              if (data1.Result[0].Semester6[j].courseName === courseName) {
                data1.Result[0].Semester6[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Drop Course Request Rejected Successfully!...",
                  });
                }
              }
            }
          } else if (data.semester === 7) {
            for (var j = 0; j < data1.Result[0].Semester7.length; j++) {
              if (data1.Result[0].Semester7[j].courseName === courseName) {
                data1.Result[0].Semester7[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message: "Drop Course Request Rejected Successfully!...",
                  });
                }
              }
            }
          } else if (data.semester === 8) {
            for (var j = 0; j < data1.Result[0].Semester8.length; j++) {
              if (data1.Result[0].Semester8[j].courseName === courseName) {
                data1.Result[0].Semester8[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                }
              }
            }
          } else if (data.semester === 9) {
            for (var j = 0; j < data1.Result[0].Semester9.length; j++) {
              if (data1.Result[0].Semester9[j].courseName === courseName) {
                data1.Result[0].Semester9[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                }
              }
            }
          } else if (data.semester === 10) {
            for (var j = 0; j < data1.Result[0].Semester10.length; j++) {
              if (data1.Result[0].Semester10[j].courseName === courseName) {
                data1.Result[0].Semester10[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                }
              }
            }
          } else if (data.semester === 11) {
            for (var j = 0; j < data1.Result[0].Semester11.length; j++) {
              if (data1.Result[0].Semester11[j].courseName === courseName) {
                data1.Result[0].Semester11[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                }
              }
            }
          } else if (data.semester === 12) {
            for (var j = 0; j < data1.Result[0].Semester12.length; j++) {
              if (data1.Result[0].Semester12[j].courseName === courseName) {
                data1.Result[0].Semester12[j].status = "enrolled";
                await data1.save();
                // notifications
                const N_message = `has Reject your request to drop ${courseName} course.`;
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
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                } else {
                  await addNotification.notifi(name, N_message);
                  await addNotification.save();
                  res.status(200).json({
                    status: "success",
                    message:
                      "Drop course request has been rejected successfuly.",
                  });
                }
              }
            }
          } else {
            return next(
              new AppError("You Do not registered in any semester", 400)
            );
            // res.status(400).send("error");
          }
        }
      }
    }
  }
});
//jis course ka deletee button per click kra delete ho jai
//student ka schema ma sa bi ja ka update ker da
//-----------------------------DROP FORM------------------

exports.DropForm = catchAsync(async (req, res, next) => {
  const { registrationId } = req.params;
  const data = await CourseRequest.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
    // res.status(400).send("no record found");
  } else {
    res.status(200).json({
      status: "success",
      message: data,
    });
  }
});
