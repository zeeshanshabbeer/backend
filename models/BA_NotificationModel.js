// name,regId,section,email,cgpa,phone,address,course(code,title,credith),reason
const mongoose = require("mongoose");
const BA_NotificationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  notification: [
    {
      registrationId: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
    },
  ],
});
// add notification in array
BA_NotificationSchema.methods.notifi = async function (
  registrationId,
  message
) {
  try {
    this.notification = this.notification.concat({ registrationId, message });
    await this.save();
    return this.notification;
  } catch (error) {
    console.log(error);
  }
};

// create the collection in database
const BA_Notification = mongoose.model(
  "BA_Notification",
  BA_NotificationSchema
);
module.exports = BA_Notification;
