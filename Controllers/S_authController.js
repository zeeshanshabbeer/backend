const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Student = require("../models/StudentModel");
const bcrypt = require("bcryptjs");

//create the token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
};
//send the token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie("jwtoken_S", token, {
    expires: new Date(
      Date.now() + 3600000 //1 hour
    ),
    httpOnly: true,
    // secure: true,
    // sameSite: "none",
  });
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//authentication
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.Cookies.jwtoken_S) {
    token = req.Cookies.jwtoken_S;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 400)
    );
  }

  // 2) Verification token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user still exists
  const rootuser = await Student.findById(decoded.id);
  if (!rootuser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        400
      )
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.rootuser = rootuser;
  req.rootuserResult = rootuser.Result[0];
  req.rootuserSemester1 = rootuser.Result[0].Semester1;
  req.rootuserSemester2 = rootuser.Result[0].Semester2;
  req.rootuserSemester3 = rootuser.Result[0].Semester3;
  req.rootuserSemester4 = rootuser.Result[0].Semester4;
  req.rootuserSemester5 = rootuser.Result[0].Semester5;
  req.rootuserSemester6 = rootuser.Result[0].Semester6;
  req.rootuserSemester7 = rootuser.Result[0].Semester7;
  req.rootuserSemester8 = rootuser.Result[0].Semester8;
  req.rootuserSemester9 = rootuser.Result[0].Semester9;
  req.rootuserSemester10 = rootuser.Result[0].Semester10;
  req.rootuserSemester11 = rootuser.Result[0].Semester11;
  req.rootuserSemester12 = rootuser.Result[0].Semester12;
  req.userID = rootuser._id;
  next();
});

//registration of student
exports.registration = catchAsync(async (req, res, next) => {
  const student = await Student.create(req.body);
  res.status(200).json({
    status: "success",
    message: "Student Registered Successfully",
  });
  // res.status(200).send(student);
});

//Student Login
exports.login = catchAsync(async (req, res, next) => {
  const { batch, regNo, password } = req.body;
  const registrationId = batch.concat("-BCS-", regNo);
  const Studentlogin = await Student.findOne({
    registrationId: registrationId,
  });
  if (Studentlogin) {
    const ismatch = await bcrypt.compare(password, Studentlogin.password);
    if (!ismatch) {
      return next(new AppError("Incorrect registration no. or password", 400));
    } else {
      createSendToken(Studentlogin, 200, req, res);
    }
  } else {
    return next(new AppError("Incorrect registration no. or password", 400));
  }
});

// Student Profile
exports.Profile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: req.rootuser,
  });
  // res.status(200).send(req.rootuser);
});

//student logout
exports.Logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwtoken_S", { path: "/" });
  res.status(200).json({
    status: "success",
    message: "user Logout Successful..",
  });
  //   res.status(200).send("user logout");
});
