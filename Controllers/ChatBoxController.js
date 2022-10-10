const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const S_ChatBox = require("../models/S_ChatBoxModel");
const BA_ChatBox = require("../models/BA_ChatBoxModel");
const BA_Notification = require("../models/BA_NotificationModel");
const S_Notification = require("../models/S_NotificationsModel");
//----------------------------------------ChatBox----------------------------
//student chatbox
exports.createchat = catchAsync(async (req, res, next) => {
  const { subject, message } = req.body;
  const user = req.rootuser;
  const { registrationId, name, batch, batchAdvisorName } = user;
  const record = await S_ChatBox.findOne({ registrationId, subject });
  if (!record) {
    //save in student side
    const S_message = new S_ChatBox({
      registrationId,
      batch,
      subject,
    });
    await S_message.S_chatbox(name, message);
    await S_message.save();
    //save in teacherSchema
    const BA_message = new BA_ChatBox({
      registrationId,
      batch,
      subject,
    });
    await BA_message.BA_chatbox(name, message);
    await BA_message.save();
    // for notification
    const N_message = "has sent you a message.";
    const addNotification = await BA_Notification.findOne({
      name: batchAdvisorName,
    });
    if (!addNotification) {
      const addNoti = new BA_Notification({
        name: batchAdvisorName,
      });
      await addNoti.notifi(registrationId, N_message);
      await addNoti.save();
      res.status(200).json({
        status: "success",
        message: "Message sent successfully.",
      });
    } else {
      await addNotification.notifi(registrationId, N_message);
      await addNotification.save();
      res.status(200).json({
        status: "success",
        message: "Message sent successfully.",
      });
    }
  } else {
    return next(new AppError("This subject is already present.", 400));
  }
});
//Student send message with in subject
exports.S_sendmessage = catchAsync(async (req, res, next) => {
  const { subject, message } = req.params;
  const user = req.rootuser;
  const { registrationId, name, batch, batchAdvisorName } = user;
  // for student
  const S_record = await S_ChatBox.findOne({ registrationId, subject });
  if (!S_record) {
    return next(new AppError("This subject is already present.", 400));
  } else {
    await S_record.S_chatbox(name, message);
    await S_record.save();
    // for batchadvisor schema
    const BA_record = await BA_ChatBox.findOne({ registrationId, subject });
    if (!BA_record) {
      const BA_message = new BA_ChatBox({
        registrationId,
        batch,
        subject,
      });
      await BA_message.BA_chatbox(name, message);
      await BA_message.save();
    } else {
      await BA_record.BA_chatbox(name, message);
      await BA_record.save();
    }
    // for notification
    const N_message = "has sent you a message.";
    const addNotification = await BA_Notification.findOne({
      name: batchAdvisorName,
    });
    if (!addNotification) {
      const addNoti = new BA_Notification({
        name: batchAdvisorName,
      });
      await addNoti.notifi(registrationId, N_message);
      await addNoti.save();
      res.status(200).json({
        status: "success",
        message: "Message sent successfully.",
      });
    } else {
      await addNotification.notifi(registrationId, N_message);
      await addNotification.save();
      res.status(200).json({
        status: "success",
        message: "Message sent successfully.",
      });
    }
  }
});
// student view message
exports.S_viewmessage = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { registrationId } = user;
  const S_record = await S_ChatBox.find({ registrationId });
  if (!S_record) {
    return next(new AppError("No Chat found", 400));
  } else {
    res.status(200).json({
      status: "success",
      message: S_record,
    });
  }
});
//student view specific message
exports.S_ViewSpecificMessage = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { subject } = req.params;
  const { registrationId } = user;
  const S_record = await S_ChatBox.findOne({ registrationId, subject });
  if (!S_record) {
    return next(new AppError("No Chat Found", 400));
  } else {
    res.status(200).json({
      status: "success",
      message: S_record.chat,
    });
  }
});
//delete chatbox Student
exports.S_deleteChat = catchAsync(async (req, res, next) => {
  //can also use id
  const { subject } = req.params;
  const { registrationId } = req.rootuser;
  const record = await S_ChatBox.findOne({ registrationId, subject });
  if (!record) {
    return next(new AppError("No Record Found", 400));
  } else {
    await record.delete();
    res.status(200).json({
      status: "success",
      message: "Message deleted successfully.",
    });
  }
});
//batchadvisor view message
exports.BA_viewmessages = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { batch } = user;
  const BA_record = await BA_ChatBox.find({ batch });
  if (!BA_record) {
    return next(new AppError("No Chat Record Found", 400));
  } else {
    res.status(200).json({
      status: "success",
      message: BA_record,
    });
  }
});
// batchadvisor view specific  message
exports.BA_ViewSpecificMessages = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { batch } = user;
  const { registrationId, subject } = req.params;
  const BA_record = await BA_ChatBox.find({ batch });
  if (!BA_record) {
    return next(new AppError("No Chat Message Found", 400));
    // res.status(400).send("error");
  } else {
    const BA_message = await BA_ChatBox.findOne({
      registrationId,
      subject,
    });
    if (!BA_message) {
      return next(new AppError("No Record Found", 400));
      // res.send("no record found");
    } else {
      res.status(200).json({
        status: "success",
        message: BA_message.chat,
      });
      // res.send(BA_message.chat);
    }
  }
});

//batchadvisor reply student message
exports.BA_messageReply = catchAsync(async (req, res, next) => {
  const { registrationId, subject, message } = req.params;
  // const { message } = req.body;
  const user = req.rootuser;
  const { name, batch } = user;
  const BA_record = await BA_ChatBox.findOne({ registrationId, subject });
  if (!BA_record) {
    return next(new AppError("No Record Found", 400));
    // res.status(400).send("no record found");
  } else {
    await BA_record.BA_chatbox(name, message);
    await BA_record.save();
    const S_record = await S_ChatBox.findOne({ registrationId, subject });
    if (!S_record) {
      const S_create = new S_ChatBox({
        registrationId,
        subject,
        batch,
      });
      await S_create.S_chatbox(name, message);
      await S_create.save();
    } else {
      await S_record.S_chatbox(name, message);
      await S_record.save();
    }
    // notifications
    const N_message = "has sent you a message.";
    const addNotification = await S_Notification.findOne({ registrationId });
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
});

//delete chatbox BAtch Advisor
exports.BA_deleteChat = catchAsync(async (req, res, next) => {
  //can also use id
  const { subject, registrationId } = req.params;
  const record = await BA_ChatBox.findOne({ registrationId, subject });
  if (!record) {
    return next(new AppError("No Record Found", 400));
    // res.status(400).send("no record found");
  } else {
    await record.delete();
    res.status(200).json({
      status: "success",
      message: "Message delete Successfully",
    });
    // res.send("deleted");
  }
});
