const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const FreezeSemester = require("../models/FreezeSemesterModel");
const BA_Notification = require("../models/BA_NotificationModel");
const S_Notification = require("../models/S_NotificationsModel");

//-------------------FreezeSemester------------
exports.FreezeSemester = catchAsync(async (req, res, next) => {
  const { reason, continuationTime } = req.body;
  const user = req.rootuser;
  const {
    batch,
    registrationId,
    email,
    name,
    contactNo,
    address,
    semester,
    section,
    batchAdvisorName,
  } = user;
  const { CGPA } = user.Result[0];
  const record = await FreezeSemester.findOne({ registrationId });
  if (!record) {
    const freeze = new FreezeSemester({
      batch,
      registrationId,
      semester,
      name,
      address,
      contactNo,
      email,
      CGPA,
      reason,
      section,
      continuationTime,
    });
    await freeze.save();
    // for notification
    const message = "has sent a request to freeze semester.";
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
        message: "Freeze semester request has been sent successfully.",
      });
    } else {
      await addNotification.notifi(registrationId, message);
      await addNotification.save();
      res.status(200).json({
        status: "success",
        message: "Freeze semester request has been sent successfully.",
      });
    }
  } else {
    return next(
      new AppError("Freeze semester request is already pending.", 400)
    );
  }
});
// reject Freeze semster request------------------
exports.FreezeSemester_reject = catchAsync(async (req, res, next) => {
  const { registrationId } = req.body;
  const { name } = req.rootuser;
  const data = await FreezeSemester.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
  } else {
    await data.delete();
    // notifications
    const N_message = "has reject your freeze semester request.";
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
        message: "Freeze Request Reject Successfully!..",
      });
    } else {
      await addNotification.notifi(name, N_message);
      await addNotification.save();
      res.status(200).json({
        status: "success",
        message: "Freeze Request Reject Successfully!...",
      });
    }
  }
});
//reject Freeze semster request------------------
exports.FreezeSemester_accept = catchAsync(async (req, res, next) => {
  const { name } = req.rootuser;
  const { registrationId } = req.body;
  const data = await FreezeSemester.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
  } else {
    await data.delete();
    // notifications
    const N_message = "has accept your freeze semester request.";
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
        message: "Freeze Request Accept Successfully!..",
      });
    } else {
      await addNotification.notifi(name, N_message);
      await addNotification.save();
      res.status(200).json({
        status: "success",
        message: "Freeze Request Accept Successfully!...",
      });
    }
  }
});
//----------------------FREEZE FORM-------------------

exports.FreezeForm = catchAsync(async (req, res, next) => {
  const { registrationId } = req.params;
  const data = await FreezeSemester.findOne({ registrationId });
  if (!data) {
    return next(new AppError("No Record Found", 400));
    // res.status(400).send("no record found");
  } else {
    res.status(200).json({
      status: "success",
      message: data,
    });
    // res.status(200).send(data);
  }
});
