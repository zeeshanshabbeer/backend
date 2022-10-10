// name,regId,section,email,cgpa,phone,address,course(code,title,credith),reason
const mongoose = require("mongoose");
const S_NotificationSchema = mongoose.Schema({
  registrationId: {
    type: String,
    required: true,
  },
  notification: [
    {
      name: {
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
S_NotificationSchema.methods.notifi = async function (name, message) {
  try {
    this.notification = this.notification.concat({ name, message });
    await this.save();
    return this.notification;
  } catch (error) {
    console.log(error);
  }
};
//create the collection in database
const S_Notification = mongoose.model("S_Notification", S_NotificationSchema);
module.exports = S_Notification;
