const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApprovedRequest = require("../models/ApprovedRequestModel");

//----------------------------------------ADD,Drop,Freeze requests------------------------------
// get data of approve request
exports.ApprovedRequest = catchAsync(async (req, res, next) => {
  const record = await ApprovedRequest.find();
  if (!record) {
    return next(new AppError("No Record Found", 400));
  } else {
    let records = [];
    for (let i = record.length - 1; i >= 0; i--) {
      records.push({
        _id: record[i]._id,
        registrationId: record[i].registrationId,
        semester: record[i].semester,
        name: record[i].name,
        section: record[i].section,
        courseCode: record[i].courseCode,
        courseName: record[i].courseName,
        credits: record[i].credits,
        action: record[i].action,
      });
    }
    res.status(200).json({
      status: "success",
      message: records,
    });
  }
});
//delete specific approved request
exports.Delete = catchAsync(async (req, res, next) => {
  const { _id } = req.params;
  const record = await ApprovedRequest.findByIdAndDelete({ _id });
  if (!record) {
    return next(new AppError("No Record Found", 400));
  } else {
    res.status(200).json({
      status: "success",
      message: "Request deleted successfuly.",
    });
  }
});
