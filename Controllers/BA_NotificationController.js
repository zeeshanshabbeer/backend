const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const BA_Notification = require("../models/BA_NotificationModel");

// get the notification
exports.BA_Notifications = catchAsync(async (req, res, next) => {
  const { name } = req.rootuser;
  const data = await BA_Notification.findOne({ name });
  if (!data) {
    const data1 = [];
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else {
    let notifications = [];
    for (let i = data.notification.length - 1; i >= 0; i--) {
      if (notifications.length <= 10) {
        notifications.push({
          registrationId: data.notification[i].registrationId,
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
  const { name } = req.rootuser;
  const { message, registrationId } = req.body;
  const addNotification = await BA_Notification.findOne({ name });
  if (!addNotification) {
    const addNoti = new BA_Notification({
      name,
    });
    await addNoti.notifi(registrationId, message);
    await addNoti.save();
    res.status(200).json({
      status: "success",
      message: "Send Successfully",
    });
  } else {
    await addNotification.notifi(registrationId, message);
    await addNotification.save();
    res.status(200).json({
      status: "success",
      message: "Send Successfully!...",
    });
  }
});
