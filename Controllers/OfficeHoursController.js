const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const OfficeHour = require("../models/OfficeHoursModel");

//--------------------------------office hours------------------
exports.UploadOfficeHours = catchAsync(async (req, res) => {
  const { day, from, to } = req.params;
  const user = req.rootuser;
  const { batch } = user;
  const officehour = await OfficeHour.findOne({ batch });
  if (!officehour) {
    if (to != "--") {
      return next(new AppError("Please First Select the From Time", 400));
    }
    const add = new OfficeHour({
      batch,
    });
    if (day === "Monday") {
      const to_time = from;
      await add.addMonday(day, from, to_time);
      const { abc1, abc2, abc3 } = "--";
      await add.addTuesday(abc1, abc2, abc3);
      await add.addWednesday(abc1, abc2, abc3);
      await add.addThursday(abc1, abc2, abc3);
      await add.addFriday(abc1, abc2, abc3);
      await add.save();
      res.status(200).json({
        status: "success",
        message: add,
      });
    } else if (day === "Tuesday") {
      const to_time = from;
      await add.addTuesday(day, from, to_time);
      const { abc1, abc2, abc3 } = "--";
      await add.addMonday(abc1, abc2, abc3);
      await add.addWednesday(abc1, abc2, abc3);
      await add.addThursday(abc1, abc2, abc3);
      await add.addFriday(abc1, abc2, abc3);
      await add.save();
      res.status(200).json({
        status: "success",
        message: add,
      });
    } else if (day === "Wednesday") {
      const to_time = from;
      await add.addWednesday(day, from, to_time);
      const { abc1, abc2, abc3 } = "--";
      await add.addTuesday(abc1, abc2, abc3);
      await add.addMonday(abc1, abc2, abc3);
      await add.addThursday(abc1, abc2, abc3);
      await add.addFriday(abc1, abc2, abc3);
      await add.save();
      res.status(200).json({
        status: "success",
        message: add,
      });
    } else if (day === "Thursday") {
      const to_time = from;
      await add.addThursday(day, from, to_time);
      const { abc1, abc2, abc3 } = "--";
      await add.addTuesday(abc1, abc2, abc3);
      await add.addWednesday(abc1, abc2, abc3);
      await add.addMonday(abc1, abc2, abc3);
      await add.addFriday(abc1, abc2, abc3);
      await add.save();
      res.status(200).json({
        status: "success",
        message: add,
      });
    } else if (day === "Friday") {
      const to_time = from;
      await add.addFriday(day, from, to_time);
      const { abc1, abc2, abc3 } = "--";
      await add.addTuesday(abc1, abc2, abc3);
      await add.addWednesday(abc1, abc2, abc3);
      await add.addThursday(abc1, abc2, abc3);
      await add.addMonday(abc1, abc2, abc3);
      await add.save();
      res.status(200).json({
        status: "success",
        message: add,
      });
    } else {
      return next(new AppError("Please Enter the Correct Day", 400));
    }
  } else {
    if (day === "Monday") {
      if (from === "a" || to === "a") {
        officehour.Monday[0].from = "--";
        officehour.Monday[0].to = "--";
        await officehour.save();
        res.status(200).json({
          status: "success",
          message: officehour,
        });
      } else {
        if (officehour.Monday[0].day === "Monday") {
          if (officehour.Monday[0].from === "--" && from != "--") {
            officehour.Monday[0].from = from;
            officehour.Monday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to === "--" && officehour.Monday[0].from != "--") {
            officehour.Monday[0].from = from;
            officehour.Monday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to != "--" && officehour.Monday[0].from === "--") {
            return next(new AppError("Please Select the from Time First", 400));
          } else if (to != "--" && officehour.Monday[0].from != "--") {
            if (officehour.Monday[0].from.charAt(0) <= to.charAt(0)) {
              if (officehour.Monday[0].from.charAt(1) <= to.charAt(1)) {
                if (officehour.Monday[0].from.charAt(3) <= to.charAt(3)) {
                  if (officehour.Monday[0].from.charAt(4) <= to.charAt(4)) {
                    officehour.Monday[0].to = to;
                    await officehour.save();
                    res.status(200).json({
                      status: "success",
                      message: officehour,
                    });
                  } else {
                    return next(
                      new AppError("To Time less than From Time", 400)
                    );
                  }
                } else {
                  return next(new AppError("To Time less than From Time", 400));
                }
              } else {
                return next(new AppError("To Time less than From Time", 400));
              }
            } else {
              return next(new AppError("To Time less than From Time", 400));
            }
          } else {
            return next(new AppError("Error", 400));
          }
        }
      }
    } else if (day === "Tuesday") {
      if (from === "a" || to === "a") {
        officehour.Tuesday[0].from = "--";
        officehour.Tuesday[0].to = "--";
        await officehour.save();
        res.status(200).json({
          status: "success",
          message: officehour,
        });
      } else {
        if (officehour.Tuesday[0].day === "Tuesday") {
          if (officehour.Tuesday[0].from === "--" && from != "--") {
            officehour.Tuesday[0].from = from;
            officehour.Tuesday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to === "--" && officehour.Tuesday[0].from != "--") {
            officehour.Tuesday[0].from = from;
            officehour.Tuesday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to != "--" && officehour.Tuesday[0].from === "--") {
            return next(new AppError("Please Select the From Time First", 400));
          } else if (to != "--" && officehour.Tuesday[0].from != "--") {
            if (officehour.Tuesday[0].from.charAt(0) <= to.charAt(0)) {
              if (officehour.Tuesday[0].from.charAt(1) <= to.charAt(1)) {
                if (officehour.Tuesday[0].from.charAt(3) <= to.charAt(3)) {
                  if (officehour.Tuesday[0].from.charAt(4) <= to.charAt(4)) {
                    officehour.Tuesday[0].to = to;
                    await officehour.save();
                    res.status(200).json({
                      status: "success",
                      message: officehour,
                    });
                  } else {
                    return next(
                      new AppError("To time less than From time", 400)
                    );
                  }
                } else {
                  return next(new AppError("To time less than From time", 400));
                }
              } else {
                return next(new AppError("To time less than From time", 400));
              }
            } else {
              return next(new AppError("To time less than From time", 400));
            }
          } else {
            return next(new AppError("Error", 400));
          }
        }
      }
    } else if (day === "Wednesday") {
      if (from === "a" || to === "a") {
        officehour.Wednesday[0].from = "--";
        officehour.Wednesday[0].to = "--";
        await officehour.save();
        res.status(200).json({
          status: "success",
          message: officehour,
        });
      } else {
        if (officehour.Wednesday[0].day === "Wednesday") {
          if (officehour.Wednesday[0].from === "--" && from != "--") {
            officehour.Wednesday[0].from = from;
            officehour.Wednesday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to === "--" && officehour.Wednesday[0].from != "--") {
            officehour.Wednesday[0].from = from;
            officehour.Wednesday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to != "--" && officehour.Wednesday[0].from === "--") {
            return next(new AppError("Please select the from time first", 400));
          } else if (to != "--" && officehour.Wednesday[0].from != "--") {
            if (officehour.Wednesday[0].from.charAt(0) <= to.charAt(0)) {
              if (officehour.Wednesday[0].from.charAt(1) <= to.charAt(1)) {
                if (officehour.Wednesday[0].from.charAt(3) <= to.charAt(3)) {
                  if (officehour.Wednesday[0].from.charAt(4) <= to.charAt(4)) {
                    officehour.Wednesday[0].to = to;
                    await officehour.save();
                    res.status(200).json({
                      status: "success",
                      message: officehour,
                    });
                  } else {
                    return next(
                      new AppError("To time less than From time", 400)
                    );
                  }
                } else {
                  return next(new AppError("To time less than From time", 400));
                }
              } else {
                return next(new AppError("To time less than From time", 400));
              }
            } else {
              return next(new AppError("To time less than From time", 400));
            }
          } else {
            return next(new AppError("Error", 400));
          }
        }
      }
    } else if (day === "Thursday") {
      if (from === "a" || to === "a") {
        officehour.Thursday[0].from = "--";
        officehour.Thursday[0].to = "--";
        await officehour.save();
        res.status(200).json({
          status: "success",
          message: officehour,
        });
      } else {
        if (officehour.Thursday[0].day === "Thursday") {
          if (officehour.Thursday[0].from === "--" && from != "--") {
            officehour.Thursday[0].from = from;
            officehour.Thursday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to === "--" && officehour.Thursday[0].from != "--") {
            officehour.Thursday[0].from = from;
            officehour.Thursday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to != "--" && officehour.Thursday[0].from === "--") {
            return next(new AppError("Please select the From time First", 400));
          } else if (to != "--" && officehour.Thursday[0].from != "--") {
            if (officehour.Thursday[0].from.charAt(0) <= to.charAt(0)) {
              if (officehour.Thursday[0].from.charAt(1) <= to.charAt(1)) {
                if (officehour.Thursday[0].from.charAt(3) <= to.charAt(3)) {
                  if (officehour.Thursday[0].from.charAt(4) <= to.charAt(4)) {
                    officehour.Thursday[0].to = to;
                    await officehour.save();
                    res.status(200).json({
                      status: "success",
                      message: officehour,
                    });
                  } else {
                    return next(
                      new AppError("To time less than From time", 400)
                    );
                  }
                } else {
                  return next(new AppError("To time less than From time", 400));
                }
              } else {
                return next(new AppError("To time less than From time", 400));
              }
            } else {
              return next(new AppError("To time less than From time", 400));
            }
          } else {
            return next(new AppError("Error", 400));
          }
        }
      }
    } else if (day === "Friday") {
      if (from === "a" || to === "a") {
        officehour.Friday[0].from = "--";
        officehour.Friday[0].to = "--";
        await officehour.save();
        res.status(200).json({
          status: "success",
          message: officehour,
        });
      } else {
        if (officehour.Friday[0].day === "Friday") {
          if (officehour.Friday[0].from === "--" && from != "--") {
            officehour.Friday[0].from = from;
            officehour.Friday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to === "--" && officehour.Friday[0].from != "--") {
            officehour.Friday[0].from = from;
            officehour.Friday[0].to = from;
            await officehour.save();
            res.status(200).json({
              status: "success",
              message: officehour,
            });
          } else if (to != "--" && officehour.Friday[0].from === "--") {
            return next(new AppError("please select the from time first", 400));
          } else if (to != "--" && officehour.Friday[0].from != "--") {
            if (officehour.Friday[0].from.charAt(0) <= to.charAt(0)) {
              if (officehour.Friday[0].from.charAt(1) <= to.charAt(1)) {
                if (officehour.Friday[0].from.charAt(3) <= to.charAt(3)) {
                  if (officehour.Friday[0].from.charAt(4) <= to.charAt(4)) {
                    officehour.Friday[0].to = to;
                    await officehour.save();
                    res.status(200).json({
                      status: "success",
                      message: officehour,
                    });
                  } else {
                    return next(
                      new AppError("To time less than From time", 400)
                    );
                  }
                } else {
                  return next(new AppError("To time less than From time", 400));
                }
              } else {
                return next(new AppError("To time less than From time", 400));
              }
            } else {
              return next(new AppError("To time less than From time", 400));
            }
          } else {
            return next(new AppError("Error", 400));
          }
        }
      }
    } else {
      return next(new AppError("Please Enter the Correct Day", 400));
    }
  }
});
// get office hours for student
exports.S_OfficeHour = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { batch } = user;
  const data = await OfficeHour.findOne({ batch });
  if (!data) {
    return next(new AppError("No Record Found", 400));
    // res.send("error");
  } else {
    res.status(200).json({
      status: "success",
      message: data,
    });
    // res.send(data);
  }
});
// get office hour for batch advisor
exports.BA_OfficeHours = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { batch } = user;
  const data = await OfficeHour.findOne({ batch });
  if (!data) {
    return next(new AppError("No Record Found", 400));
    // res.send("error");
  } else {
    res.status(200).json({
      status: "success",
      message: data,
    });
    // res.send(data);
  }
});
