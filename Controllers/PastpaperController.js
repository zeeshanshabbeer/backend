const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Pastpaper = require("../models/PastpaperModel");
const cloudinary = require("../utils/Clodinrary");

//-------------------PAST PAPER----------------------------
//-----------------view pastpaper--------------------------
exports.ViewPastPapers = catchAsync(async (req, res, next) => {
  const searchField1 = req.params.course_title;
  const searchField2 = req.params.paper_type;
  const searchField3 = req.params.session;
  const data = await Pastpaper.find({
    course_title: {
      $regex: searchField1,
      $options: "$eq",
    },
    paper_type: {
      $regex: searchField2,
      $options: "$eq",
    },
    session: {
      $regex: searchField3,
      $options: "$eq",
    },
  });
  if (data[0]) {
    res.status(200).json({
      status: "success",
      message: data,
    });
  } else {
    return next(new AppError("No Record Found", 400));
  }
});
//------------view specific file
exports.ViewSpecificPaper = catchAsync(async (req, res, next) => {
  const data = await Pastpaper.findById(req.params._id);
  if (!data) {
    return next(new AppError("No Record Found", 400));
  } else {
    res.status(200).json({
      status: "success",
      message: data,
    });
  }
});

exports.upload_pastpapers = catchAsync(async (req, res, next) => {
  const result = await cloudinary.uploader.upload(req.file.path);
  const uploadpaper = new Pastpaper({
    course_title: req.body.course_title,
    paper_type: req.body.paper_type,
    session: req.body.session,
    paper: result.secure_url,
    paper_name: req.file.originalname,
  });
  if (!uploadpaper) {
    return next(new AppError("No record found", 400));
  } else {
    await uploadpaper.save();
    res.status(200).json({
      status: "success",
      message: "Past paper uploaded successfully.",
    });
  }
});
