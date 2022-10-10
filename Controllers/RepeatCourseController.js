const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//for repeat courses
// Repeact course controller
exports.RepeatCourses = catchAsync(async (req, res) => {
  const user = req.rootuser;
  const { semester } = user;
  if (semester === 1) {
    let data = [];
    res.status(200).json({
      status: "success",
      message: data,
    });
  } else if (semester === 2) {
    const data = user.Result[0].Semester1;
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        await data1.push(data[i]);
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 3) {
    const data = user.Result[0].Semester1.concat(user.Result[0].Semester2);
    var data1 = []; //store all courses that can repeat
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            //no duplicate data enter
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    //check that the if he/she study that course later and improve gpa and that course remove from the repeat course array
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 4) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 5) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 6) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 7) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 8) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 9) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7,
      user.Result[0].Semester8
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 10) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7,
      user.Result[0].Semester8,
      user.Result[0].Semester9
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 11) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7,
      user.Result[0].Semester8,
      user.Result[0].Semester9,
      user.Result[0].Semester10
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  } else if (semester === 12) {
    const data = user.Result[0].Semester1.concat(
      user.Result[0].Semester2,
      user.Result[0].Semester3,
      user.Result[0].Semester4,
      user.Result[0].Semester5,
      user.Result[0].Semester6,
      user.Result[0].Semester7,
      user.Result[0].Semester8,
      user.Result[0].Semester9,
      user.Result[0].Semester10,
      user.Result[0].Semester11
    );
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].gp < 2) {
        if (data1.length === 0) {
          await data1.push(data[i]);
        } else {
          for (var k = 0; k < data1.length; k++) {
            if (data1[k].courseName === data[i].courseName) {
              if (data[i].gp > data1[k].gp) {
                await data1.splice(k, 1);
                await data1.push(data[i]);
              } else {
                console.log("this course already present");
              }
            }
          }
          await data1.push(data[i]);
        }
      }
    }
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data1.length; j++) {
        if (data[i].courseName === data1[j].courseName) {
          if (data[i].gp === data1[j].gp) {
          } else {
            if (data[i].gp >= 2) {
              await data1.splice(j, 1);
            } else if (data[i].gp < 2) {
              await data1.splice(j, 1);
              await data1.push(data[k]);
            }
          }
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: data1,
    });
  }
});
