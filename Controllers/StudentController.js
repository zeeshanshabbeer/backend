const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Student = require("../models/StudentModel");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

//update student password
exports.S_updatepassword = catchAsync(async (req, res, next) => {
  const { old_password, new_password, confirm_password } = req.body;
  const student = await Student.findById(req.rootuser);
  const isMatched = await bcrypt.compare(old_password, student.password);
  if (!isMatched) {
    return next(new AppError("Old password incorrect.", 400));
  } else if (new_password != confirm_password) {
    return next(new AppError("Passwords do no match.", 400));
  }
  student.password = new_password;
  await student.save();
  res.status(200).json({
    status: "success",
    message: "Password updated successfully.",
  });
});

//----------------------update contact number----------------
//update student contact number
exports.S_updatecontact = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.rootuser);
  student.contactNo = req.body.contactNo;
  await student.save();
  res.status(200).json({
    status: "success",
    message: "Contact number updated successfully.",
  });
});

//reset password email for student
exports.S_sendresetemail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      return next(new AppError("Email not sent.", 400));
    } else {
      const token = buffer.toString("hex");
      const student = await Student.findOne({ email });
      if (!student) {
        return next(new AppError("Please enter the correct email.", 400));
      } else {
        student.resettoken = token;
        student.expiretoken = Date.now() + 3600000;
        await student.save({ validateBeforeSave: false });
        const message = `
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
                                 <h3 style="display: inline">${student.name},</h3>
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
                                 ><a style="color: white; text-decoration: none;" href="http://localhost:3000/NewStudentPassword/${token}">
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
          sendEmail({
            to: student.email,
            subject: "Password Reset Link",
            html: message,
          });
          res.status(200).json({
            status: "success",
            message: "Email send Successfully!...",
          });
        } catch (err) {
          student.resettoken = undefined;
          student.expiretoken = undefined;
          await student.save();
          return next(new AppError("Email not send", 400));
        }
      }
    }
  });
});

//reset password for student
exports.S_resetpassword = catchAsync(async (req, res, next) => {
  const { new_password, confirm_password } = req.body;
  const sentToken = req.body.token;
  if (new_password != confirm_password) {
    return next(new AppError("Passwords do no match.", 400));
  }
  const student = await Student.findOne({
    resettoken: sentToken,
    expiretoken: { $gt: Date.now() },
  });

  if (!student) {
    return next(new AppError("Token Expires", 400));
  }
  student.password = new_password;
  student.resettoken = undefined;
  student.expiretoken = undefined;
  await student.save();
  res.status(200).json({
    status: "success",
    message: "Password updated successfully.",
  });
});

//top menu of Student
exports.S_TopMenu = catchAsync(async (req, res, next) => {
  // console.log("get top menu");
  res.status(200).json({
    status: "success",
    message: req.rootuser,
  });
  // res.status(200).send(req.rootuser);
});

//-------------------home student--------------------
exports.Home = catchAsync(async (req, res, next) => {
  const studentdata = req.rootuser;
  const batch = studentdata.batch;
  if ("SP22" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester1,
    });
    // res.status(200).send(req.rootuserSemester1);
  } else if ("FA21" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester2,
    });
    // res.status(200).send(req.rootuserSemester2);
  } else if ("SP21" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester3,
    });
    // res.status(200).send(req.rootuserSemester3);
  } else if ("FA20" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester4,
    });
    // res.status(200).send(req.rootuserSemester4);
  } else if ("SP20" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester5,
    });
    // res.status(200).send(req.rootuserSemester5);
  } else if ("FA19" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester6,
    });
    // res.status(200).send(req.rootuserSemester6);
  } else if ("SP19" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester7,
    });
    // res.status(200).send(req.rootuserSemester7);
  } else if ("FA18" === batch) {
    console.log(req.rootuserSemester8);
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester8,
    });
    // res.status(200).send(req.rootuserSemester8);
  } else if ("SP18" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester9,
    });
    // res.status(200).send(req.rootuserSemester9);
  } else if ("FA17" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester10,
    });
    // res.status(200).send(req.rootuserSemester10);
  } else if ("SP17" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester11,
    });
    // res.status(200).send(req.rootuserSemester11);
  } else if ("FA16" === batch) {
    res.status(200).json({
      status: "success",
      message: req.rootuserSemester12,
    });
    // res.status(200).send(req.rootuserSemester12);
  } else {
    return next(new AppError("enter correct batch", 400));
    // res.status(200).send("error");
  }
});

//----------------------credits hours-----------
exports.HomeCredits = catchAsync(async (req, res, next) => {
  const student = req.rootuser;
  const { semester } = student;
  let cred = 0;
  if (semester === 1) {
    for (let i = 0; i < student.Result[0].Semester1.length; i++) {
      if (student.Result[0].Semester1[i].status === "enrolled") {
        cred += student.Result[0].Semester1[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
    // res.json(cred);
  } else if (semester === 2) {
    for (let i = 0; i < student.Result[0].Semester2.length; i++) {
      if (student.Result[0].Semester2[i].status === "enrolled") {
        cred += student.Result[0].Semester2[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
    // res.json(cred);
  } else if (semester === 3) {
    for (let i = 0; i < student.Result[0].Semester3.length; i++) {
      if (student.Result[0].Semester3[i].status === "enrolled") {
        cred += student.Result[0].Semester3[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 4) {
    for (let i = 0; i < student.Result[0].Semester4.length; i++) {
      if (student.Result[0].Semester4[i].status === "enrolled") {
        cred += student.Result[0].Semester4[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 5) {
    for (let i = 0; i < student.Result[0].Semester5.length; i++) {
      if (student.Result[0].Semester5[i].status === "enrolled") {
        cred += student.Result[0].Semester5[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 6) {
    for (let i = 0; i < student.Result[0].Semester6.length; i++) {
      if (student.Result[0].Semester6[i].status === "enrolled") {
        cred += student.Result[0].Semester6[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 7) {
    for (let i = 0; i < student.Result[0].Semester7.length; i++) {
      if (student.Result[0].Semester7[i].status === "enrolled") {
        cred += student.Result[0].Semester7[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 8) {
    for (let i = 0; i < student.Result[0].Semester8.length; i++) {
      if (student.Result[0].Semester8[i].status === "enrolled") {
        cred += student.Result[0].Semester8[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 9) {
    for (let i = 0; i < student.Result[0].Semester9.length; i++) {
      if (student.Result[0].Semester9[i].status === "enrolled") {
        cred += student.Result[0].Semester9[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 10) {
    for (let i = 0; i < student.Result[0].Semester10.length; i++) {
      if (student.Result[0].Semester10[i].status === "enrolled") {
        cred += student.Result[0].Semester10[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 11) {
    for (let i = 0; i < student.Result[0].Semester11.length; i++) {
      if (student.Result[0].Semester11[i].status === "enrolled") {
        cred += student.Result[0].Semester11[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  } else if (semester === 12) {
    for (let i = 0; i < student.Result[0].Semester12.length; i++) {
      if (student.Result[0].Semester12[i].status === "enrolled") {
        cred += student.Result[0].Semester12[i].credits;
      }
    }
    res.status(200).json({
      status: "success",
      message: cred,
    });
  }
});
