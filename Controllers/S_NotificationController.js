const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const S_Notification = require("../models/S_NotificationsModel");

// get all notification
exports.Notifications = catchAsync(async (req, res, next) => {
  const { registrationId } = req.rootuser;
  const data = await S_Notification.findOne({ registrationId });
  if (!data) {
    const data1 = [];
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else {
    let notifications = [];
    console.log(data.notification.length);
    for (let i = data.notification.length - 1; i >= 0; i--) {
      if (notifications.length <= 10) {
        notifications.push({
          name: data.notification[i].name,
          message: data.notification[i].message,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: notifications,
    });
  }
});

// post the notification
exports.uploadNotification = catchAsync(async (req, res, next) => {
  const { registrationId } = req.rootuser;
  const { message, name } = req.body;
  const addNotification = await S_Notification.findOne({ registrationId });
  if (!addNotification) {
    const addNoti = new S_Notification({
      registrationId,
    });
    await addNoti.notifi(name, message);
    await addNoti.save();
    res.status(200).json({
      status: "success",
      message: "Send Successfully!..",
    });
  } else {
    await addNotification.notifi(name, message);
    await addNotification.save();
    res.status(200).json({
      status: "success",
      message: "Send Successfully!...",
    });
  }
});
