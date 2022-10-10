const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const BatchAdvisor = require("../models/BatchAdvisorModel");
const bcrypt = require("bcryptjs");

//create the token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY1, {
    expiresIn: "1h",
  });
};
//send the token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie("jwtoken_BA", token, {
    expires: new Date(
      Date.now() + 3600000 //1 hour
    ),
    httpOnly: true,
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
  } else if (req.cookies.jwtoken_BA) {
    token = req.cookies.jwtoken_BA;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY1);

  // 3) Check if user still exists
  const rootuser = await BatchAdvisor.findById(decoded.id);
  if (!rootuser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.rootuser = rootuser;
  req.userID = rootuser._id;
  next();
});

//Batch Advisor registration
exports.registration = catchAsync(async (req, res, next) => {
  const batchadvisor = await BatchAdvisor.create(req.body);
  res.status(200).json({
    status: "success",
    message: batchadvisor,
  });
  // res.status(200).send(batchadvisor);
});

//for batch advisor login
exports.Login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //filled the filed or not
  if (!email || !password) {
    return next(new AppError("Filled the Data", 400));
    // return res.status(400).json({ error: "filled the data" });
  }
  const Batchadvisorlogin = await BatchAdvisor.findOne({ email: email });
  if (Batchadvisorlogin) {
    const ismatch = await bcrypt.compare(password, Batchadvisorlogin.password);
    if (!ismatch) {
      return next(new AppError("Incorrect Password", 400));
      // return res.status(400).json({ error: "incorrect password" });
    } else {
      createSendToken(Batchadvisorlogin, 201, req, res);
    }
  } else {
    return next(new AppError("Incorrect Email", 400));
    // res.status(400).json({ error: "INCORRECT Email" });
  }
});

//Batch Advisor profile
exports.Profile = catchAsync(async (req, res, next) => {
  // console.log("Get the batch advisor profile data");
  res.status(200).json({
    status: "success",
    message: req.rootuser,
  });
});

exports.Logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwtoken_BA", { path: "/" });
  res.status(200).json({
    status: "success",
    message: "Logout Successfully",
  });
});
