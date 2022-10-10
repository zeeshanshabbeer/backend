const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const BatchAdvisor = require("../models/BatchAdvisorModel");
const FreezeSemester = require("../models/FreezeSemesterModel");
const AddCourse = require("../models/AddCourseModel");
const CourseRequest = require("../models/DropCourseModel");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const bcrypt = require("bcryptjs");

//update password batch advisor
exports.BA_updatepassword = catchAsync(async (req, res, next) => {
  const { old_password, new_password, confirm_password } = req.body;
  const batchadvisor = await BatchAdvisor.findById(req.rootuser);
  const isMatched = await bcrypt.compare(old_password, batchadvisor.password);
  if (!isMatched) {
    return next(new AppError("Old password incorrect.", 400));
  } else if (new_password != confirm_password) {
    return next(new AppError("Passwords do no match.", 400));
  }
  batchadvisor.password = new_password;
  await batchadvisor.save();
  res.status(200).json({
    status: "success",
    message: "Password updated successfully.",
  });
  // res.status(200).send("Password updated successfully");
});

//update batch advisor contact number
exports.BA_updatecontact = catchAsync(async (req, res, next) => {
  const { email } = req.rootuser;
  const batchadvisor = await BatchAdvisor.findOne({ email });
  if (batchadvisor) {
    batchadvisor.contactNo = req.body.contactNo;
    await batchadvisor.save();
    res.status(200).json({
      status: "success",
      message: "Contact number updated successfully.",
    });
  }
});

//reset password email for batchadvisor
exports.BA_sendresetemail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      return next(new AppError("Email not sent.", 400));
    } else {
      const token = buffer.toString("hex");
      const batchadvisor = await BatchAdvisor.findOne({ email });
      if (!batchadvisor) {
        return next(new AppError("Please enter the correct email.", 400));
      } else {
        batchadvisor.resettoken = token;
        batchadvisor.expiretoken = Date.now() + 360000000;
        await batchadvisor.save({ validateBeforeSave: false });

        const html = `
                         <div
                           style="
                             text-align: center;
                             background-color: rgb(255, 193, 122);
                             margin-left: 00px;
                             margin-right: 00px;
                             padding-top: 1px;
                             padding-bottom: 70px;
                           "
                         >
                           <h2>Tipster</h2>
                           <h4 style="margin-top: -20px">A Digital Batch Advisor</h4>
                           <div>
                             <div
                               style="
                                 background-color: rgb(255, 255, 255);
                                 margin-left: 30px;
                                 margin-right: 30px;
                                 padding-top: 30px;
                                 padding-bottom: 30px;
                                 border-radius: 5px;
                               "
                             >
                               <form action="">
                                 <h3 style="display: inline">Hello</h3>
                                 <h3 style="display: inline">${batchadvisor.name},</h3>
                                 <h2>Forgot your password?</h2>
                                 <p style="font-size: 18px; padding-top: 10px">
                                   That's okay, it happens! Click on the button <br />below to reset
                                   your password.
                                 </p>
                                 <button
                                   style="
                                     background-color: rgb(0, 30, 129);
                                     padding: 10px 10px 10px 10px;
                                     border: none;
                                     border-radius: 5px;
                                     font-weight: bold;
                                     margin-top: 10px;
                                     color: white;
                                   "
                                 ><a style="color: white; text-decoration: none;" href="http://localhost:3000/NewBatchAdvisorPassword/${token}">
                                   RESET YOUR PASSWORD
                                 </button>
                                 <h4 style="margin-top: 40px; font-size: 15px">Regards,</h4>
                                 <h4 style="margin-top: -20px; font-size: 15px">The Tipster Team</h4>
                               </form>
                             </div>
                           </div>
                         </div>
                                          
                     `;
        try {
          await sendEmail({
            to: batchadvisor.email,
            subject: "Password Reset Link",
            html: html,
          });
          res.status(200).json({
            status: "success",
            message: "Email send Successfully!...",
          });
        } catch (error) {
          batchadvisor.resettoken = undefined;
          batchadvisor.expiretoken = undefined;

          await batchadvisor.save();

          return next(new AppError("Email not send", 400));
        }
      }
    }
  });
});

//reset password for batchadvisor
exports.BA_resetpassword = catchAsync(async (req, res, next) => {
  const { new_password, confirm_password } = req.body;
  const sentToken = req.body.token;
  if (new_password != confirm_password) {
    return next(new AppError("New and Confirm Password does not match", 400));
  }
  const batchadvisor = await BatchAdvisor.findOne({
    resettoken: sentToken,
    expiretoken: { $gt: Date.now() },
  });
  if (!batchadvisor) {
    return next(new AppError("Token expires", 400));
  }
  batchadvisor.password = new_password;
  batchadvisor.resettoken = undefined;
  batchadvisor.expiretoken = undefined;
  await batchadvisor.save();
  res.status(200).json({
    status: "success",
    message: "Password updated successfully.",
  });
});

//topmenu of batchadvisor
exports.BA_TopMenu = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: req.rootuser,
  });
  // res.status(200).send(req.rootuser);
});
//----------------------home page  batch advisor------------------
//freeze requests
//drop pending request
//add pending requets
exports.BA_Home = catchAsync(async (req, res, next) => {
  const batchadvisor = req.rootuser;
  const batch = batchadvisor.batch;
  const data1 = await FreezeSemester.find({ batch });
  const data2 = await AddCourse.find({ batch });
  const data3 = await CourseRequest.find({ batch });
  if (!data3 && !data1 && !data2) {
    return next(new AppError("No Record Found", 400));
  } else {
    const data = data3.concat(data1, data2);
    res.status(200).json({
      status: "success",
      message: data,
    });
  }
});
