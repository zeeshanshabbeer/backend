const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//---------------------Degree planner----------------------
exports.degreeplanner = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { semester } = user;
  if (semester === 1 || semester === 2 || semester === 3 || semester === 4) {
    res.status(200).json({
      status: "success",
      data: "Sorry! You must be at least in 5th semester to view recommended track!",
      name: "",
    });
    // res.status(200).json({
    //   data: "Sorry! You must be at least in 5th semester to view recommended track!",
    // });
  } else {
    if (semester === 5) {
      let courseMarks = [];
      const sems1 = req.rootuserSemester1;
      const sems2 = req.rootuserSemester2;
      const sems3 = req.rootuserSemester3;
      const sems4 = req.rootuserSemester4;
      const courses = sems1.concat(sems2, sems3, sems4);
      for (let i = 0; i < courses.length; i++) {
        if (
          courses[i].courseCode === "CSC241" ||
          courses[i].courseCode === "CSC291" ||
          courses[i].courseCode === "MTH231" ||
          courses[i].courseCode === "MTH262" ||
          courses[i].courseCode === "CSC371"
        ) {
          // also remove duplicate value
          if (courseMarks.length === 0) {
            courseMarks.push({
              courseCode: courses[i].courseCode,
              Marks: courses[i].marks,
            });
          } else {
            //if marks is greater than last one
            let duplicate = 0;
            if (courseMarks.length > 0) {
              for (let j = 0; j < courseMarks.length; j++) {
                if (courseMarks[j].courseCode === courses[i].courseCode) {
                  duplicate = 1;
                  if (courseMarks[j].Marks >= courses[i].marks) {
                    duplicate = 2;
                  } else {
                    courseMarks.splice(j, 1);
                    courseMarks.push({
                      courseCode: courses[i].courseCode,
                      Marks: courses[i].marks,
                    });
                  }
                }
              }
              if (duplicate === 0) {
                courseMarks.push({
                  courseCode: courses[i].courseCode,
                  Marks: courses[i].marks,
                });
              }
            }
          }
        }
      }
      // store marks in separate variable
      let CSC241 = -1;
      let CSC291 = -1;
      let MTH231 = -1;
      let MTH262 = -1;
      let CSC371 = -1;
      for (let i = 0; i < courseMarks.length; i++) {
        if (courseMarks[i].courseCode === "CSC241") {
          CSC241 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC291") {
          CSC291 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "MTH231") {
          MTH231 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "MTH262") {
          MTH262 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC371") {
          CSC371 = courseMarks[i].Marks;
        }
      }

      // logic
      if (
        CSC241 <= 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
          name: "",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 2",
          name: "Database Technologies",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
          name: "",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 2",
          name: "Database Technologies",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
          name: "",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 2",
          name: "Database Technologies",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 <= 0 &&
        CSC291 > MTH262 &&
        CSC291 > MTH231
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        if (CSC291 < MTH262 || CSC291 < MTH231)
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
      } else if (
        CSC241 <= 0 &&
        CSC291 > 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 2",
          name: "Database Technologies",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        if (
          MTH231 > CSC241 &&
          MTH262 > CSC241 &&
          MTH262 > CSC371 &&
          MTH231 > CSC371
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        }
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 <= 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 <= 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 <= 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 > 0 &&
        MTH262 <= 0 &&
        CSC371 > 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (
        CSC241 > 0 &&
        CSC241 > 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 <= 0
      ) {
        if (MTH231 + MTH262 > CSC241 + CSC241) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        }
      } else if (
        CSC241 > 0 &&
        CSC291 > 0 &&
        MTH231 > 0 &&
        MTH262 > 0 &&
        CSC371 > 0
      ) {
        if (CSC241 > 80) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (MTH231 + MTH262 > CSC241 + CSC291 && CSC371 < 75) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (MTH231 + MTH262 <= CSC241 + CSC291 && CSC371 < 75) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (MTH231 + MTH262 <= CSC241 + CSC291 && CSC371 > 75) {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        } else {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        }
      }
    } else if (semester === 6) {
      let courseMarks = [];
      const sems1 = req.rootuserSemester1;
      const sems2 = req.rootuserSemester2;
      const sems3 = req.rootuserSemester3;
      const sems4 = req.rootuserSemester4;
      const sems5 = req.rootuserSemester5;
      const courses = sems1.concat(sems2, sems3, sems4, sems5);
      for (let i = 0; i < courses.length; i++) {
        if (
          courses[i].courseCode === "CSC241" ||
          courses[i].courseCode === "CSC291" ||
          courses[i].courseCode === "MTH231" ||
          courses[i].courseCode === "MTH262" ||
          courses[i].courseCode === "CSC371" ||
          courses[i].courseCode === "CSC303" ||
          courses[i].courseCode === "CSC494" ||
          courses[i].courseCode === "CSC495" ||
          courses[i].courseCode === "CSC347" ||
          courses[i].courseCode === "CSC461" ||
          courses[i].courseCode === "CSC496" ||
          courses[i].courseCode === "CSC331" ||
          courses[i].courseCode === "CSC353" ||
          courses[i].courseCode === "CSC354" ||
          courses[i].courseCode === "CSC355"
        ) {
          //also remove duplicate value
          if (courseMarks.length === 0) {
            courseMarks.push({
              courseCode: courses[i].courseCode,
              Marks: courses[i].marks,
            });
          } else {
            let duplicate = 0;
            if (courseMarks.length > 0) {
              for (let j = 0; j < courseMarks.length; j++) {
                if (courseMarks[j].courseCode === courses[i].courseCode) {
                  duplicate = 1;
                }
              }
              if (duplicate === 0) {
                courseMarks.push({
                  courseCode: courses[i].courseCode,
                  Marks: courses[i].marks,
                });
              }
            }
          }
        }
      }
      // store marks in separate variable
      let CSC241 = -1;
      let CSC291 = -1;
      let MTH231 = -1;
      let MTH262 = -1;
      let CSC371 = -1;
      let CSC303 = -1;
      let CSC494 = -1;
      let CSC495 = -1;
      let CSC347 = -1;
      let CSC461 = -1;
      let CSC496 = -1;
      let CSC331 = -1;
      let CSC353 = -1;
      let CSC354 = -1;
      let CSC355 = -1;
      for (let i = 0; i < courseMarks.length; i++) {
        if (courseMarks[i].courseCode === "CSC241") {
          CSC241 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC291") {
          CSC291 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "MTH231") {
          MTH231 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "MTH262") {
          MTH262 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC371") {
          CSC371 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC303") {
          CSC303 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC494") {
          CSC494 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC495") {
          CSC495 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC347") {
          CSC347 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC461") {
          CSC461 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC496") {
          CSC496 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC331") {
          CSC331 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC353") {
          CSC353 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC354") {
          CSC354 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC355") {
          CSC355 = courseMarks[i].Marks;
        }
      }

      //logic
      if (CSC303 == 0 || CSC303 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (CSC494 == 0 || CSC494 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (CSC495 == 0 || CSC495 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 1",
          name: "Software Development",
        });
      } else if (CSC347 == 0 || CSC347 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 2",
          name: "Database Technologies",
        });
      } else if (CSC461 == 0 || CSC461 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 2",
          name: "Database Technologies",
        });
      } else if (CSC461 == 0 || CSC461 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 2",
          name: "Database Technologies",
        });
      } else if (CSC461 == 0 || CSC461 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (CSC353 == 0 || CSC353 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (CSC354 == 0 || CSC354 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else if (CSC354 == 0 || CSC354 >= 3) {
        res.status(200).json({
          status: "success",
          data: "Track 3",
          name: "Artificial Intelligence and Graphics",
        });
      } else {
        if (
          CSC241 <= 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
            name: "",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
            name: "",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
            name: "",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 <= 0 &&
          CSC291 > MTH262 &&
          CSC291 > MTH231
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          if (CSC291 < MTH262 || CSC291 < MTH231)
            res.status(200).json({
              status: "success",
              data: "Track 2",
              name: "Database Technologies",
            });
        } else if (
          CSC241 <= 0 &&
          CSC291 > 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          if (
            MTH231 > CSC241 &&
            MTH262 > CSC241 &&
            MTH262 > CSC371 &&
            MTH231 > CSC371
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else {
            res.status(200).json({
              status: "success",
              data: "Track 2",
              name: "Database Technologies",
            });
          }
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 <= 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 <= 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 <= 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 > 0 &&
          MTH262 <= 0 &&
          CSC371 > 0
        ) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (
          CSC241 > 0 &&
          CSC241 > 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 <= 0
        ) {
          if (MTH231 + MTH262 > CSC241 + CSC241) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          }
        } else if (
          CSC241 > 0 &&
          CSC291 > 0 &&
          MTH231 > 0 &&
          MTH262 > 0 &&
          CSC371 > 0
        ) {
          if (CSC241 > 80) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (MTH231 + MTH262 > CSC241 + CSC291 && CSC371 < 75) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else if (MTH231 + MTH262 <= CSC241 + CSC291 && CSC371 < 75) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (MTH231 + MTH262 <= CSC241 + CSC291 && CSC371 > 75) {
            res.status(200).json({
              status: "success",
              data: "Track 2",
              name: "Database Technologies",
            });
          } else {
            res.status(200).json({
              status: "success",
              data: "Track 2",
              name: "Database Technologies",
            });
          }
        }
      }
    } else if (semester === 7) {
      let count1 = 0;
      let count2 = 0;
      let count3 = 0;
      let courseMarks = [];
      const sems1 = req.rootuserSemester1;
      const sems2 = req.rootuserSemester2;
      const sems3 = req.rootuserSemester3;
      const sems4 = req.rootuserSemester4;
      const sems5 = req.rootuserSemester5;
      const sems6 = req.rootuserSemester6;
      const courses = sems1.concat(sems2, sems3, sems4, sems5, sems6);
      for (let i = 0; i < courses.length; i++) {
        if (
          courses[i].courseCode === "CSC241" ||
          courses[i].courseCode === "CSC291" ||
          courses[i].courseCode === "MTH231" ||
          courses[i].courseCode === "MTH262" ||
          courses[i].courseCode === "CSC371" ||
          courses[i].courseCode === "CSC303" ||
          courses[i].courseCode === "CSC494" ||
          courses[i].courseCode === "CSC495" ||
          courses[i].courseCode === "CSC347" ||
          courses[i].courseCode === "CSC461" ||
          courses[i].courseCode === "CSC496" ||
          courses[i].courseCode === "CSC331" ||
          courses[i].courseCode === "CSC353" ||
          courses[i].courseCode === "CSC354" ||
          courses[i].courseCode === "CSC355"
        ) {
          //also remove duplicate value
          if (courseMarks.length === 0) {
            courseMarks.push({
              courseCode: courses[i].courseCode,
              Marks: courses[i].marks,
            });
          } else {
            let duplicate = 0;
            if (courseMarks.length > 0) {
              for (let j = 0; j < courseMarks.length; j++) {
                if (courseMarks[j].courseCode === courses[i].courseCode) {
                  duplicate = 1;
                }
              }
              if (duplicate === 0) {
                courseMarks.push({
                  courseCode: courses[i].courseCode,
                  Marks: courses[i].marks,
                });
              }
            }
          }
        }
      }
      // store marks in separate variable
      let CSC241 = -1;
      let CSC291 = -1;
      let MTH231 = -1;
      let MTH262 = -1;
      let CSC371 = -1;
      let CSC303 = -1;
      let CSC494 = -1;
      let CSC495 = -1;
      let CSC347 = -1;
      let CSC461 = -1;
      let CSC496 = -1;
      let CSC331 = -1;
      let CSC353 = -1;
      let CSC354 = -1;
      let CSC355 = -1;

      for (let i = 0; i < courseMarks.length; i++) {
        if (courseMarks[i].courseCode === "CSC241") {
          CSC241 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC291") {
          CSC291 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "MTH231") {
          MTH231 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "MTH262") {
          MTH262 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC371") {
          CSC371 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC303") {
          CSC303 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC494") {
          CSC494 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC495") {
          CSC495 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC347") {
          CSC347 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC461") {
          CSC461 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC496") {
          CSC496 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC331") {
          CSC331 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC353") {
          CSC353 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC354") {
          CSC354 = courseMarks[i].Marks;
        } else if (courseMarks[i].courseCode === "CSC355") {
          CSC355 = courseMarks[i].Marks;
        }
      }
      if (CSC303 >= 0) {
        count1 = count1 + 1;
      }
      if (CSC494 >= 0) {
        count1 = count1 + 1;
      }
      if (CSC495 >= 0) {
        count1 = count1 + 1;
      }
      if (CSC347 >= 0) {
        count2 = count2 + 1;
      }
      if (CSC461 >= 0) {
        count2 = count2 + 1;
      }
      if (CSC496 >= 0) {
        count2 = count2 + 1;
      }
      if (CSC331 >= 0) {
        count3 = count3 + 1;
      }
      if (CSC353 >= 0) {
        count3 = count3 + 1;
      }
      if (CSC354 >= 0) {
        count3 = count3 + 1;
      }
      if (CSC355 >= 0) {
        count3 = count3 + 1;
      }
      if (count1 >= 3) {
        res.status(200).json({
          status: "success",
          data: "You have already completed track 1, so you can study any courses from any other track.",
          name: "",
        });
      } else if (count2 >= 3) {
        res.status(200).json({
          status: "success",
          data: "You have already completed track 1, so you can study any courses from any other track.",
          name: "",
        });
      } else if (count3 >= 3) {
        res.status(200).json({
          status: "success",
          data: "You have already completed track 1, so you can study any courses from any other track.",
          name: "",
        });
      } else if (count1 == 2) {
        res.status(200).json({
          status: "success",
          data: "You are already following track 1, so you are advised to complete it.",
          name: "",
        });
      } else if (count2 == 2) {
        res.status(200).json({
          status: "success",
          data: "You are already following track 2, so you are advised to complete it.",
          name: "",
        });
      } else if (count3 == 2) {
        res.status(200).json({
          status: "success",
          data: "You are already following track 3, so you are advised to complete it.",
          name: "",
        });
      } else {
        if (CSC303 == 0 || CSC303 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (CSC494 == 0 || CSC494 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (CSC495 == 0 || CSC495 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 1",
            name: "Software Development",
          });
        } else if (CSC347 == 0 || CSC347 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        } else if (CSC461 == 0 || CSC461 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        } else if (CSC461 == 0 || CSC461 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 2",
            name: "Database Technologies",
          });
        } else if (CSC461 == 0 || CSC461 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (CSC353 == 0 || CSC353 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (CSC354 == 0 || CSC354 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else if (CSC354 == 0 || CSC354 >= 3) {
          res.status(200).json({
            status: "success",
            data: "Track 3",
            name: "Artificial Intelligence and Graphics",
          });
        } else {
          if (
            CSC241 <= 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
              name: "",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 2",
              name: "Database Technologies",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
              name: "",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 2",
              name: "Database Technologies",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Sorry! We can't recommend you any track because you need to pass prerequisites first.",
              name: "",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 2",
              name: "Database Technologies",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 <= 0 &&
            CSC291 > MTH262 &&
            CSC291 > MTH231
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            if (CSC291 < MTH262 || CSC291 < MTH231)
              res.status(200).json({
                status: "success",
                data: "Track 2",
                name: "Database Technologies",
              });
          } else if (
            CSC241 <= 0 &&
            CSC291 > 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 2",
              name: "Database Technologies",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            if (
              MTH231 > CSC241 &&
              MTH262 > CSC241 &&
              MTH262 > CSC371 &&
              MTH231 > CSC371
            ) {
              res.status(200).json({
                status: "success",
                data: "Track 3",
                name: "Artificial Intelligence and Graphics",
              });
            } else {
              res.status(200).json({
                status: "success",
                data: "Track 2",
                name: "Database Technologies",
              });
            }
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 <= 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 3",
              name: "Artificial Intelligence and Graphics",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 <= 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 <= 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 > 0 &&
            MTH262 <= 0 &&
            CSC371 > 0
          ) {
            res.status(200).json({
              status: "success",
              data: "Track 1",
              name: "Software Development",
            });
          } else if (
            CSC241 > 0 &&
            CSC241 > 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 <= 0
          ) {
            if (MTH231 + MTH262 > CSC241 + CSC241) {
              res.status(200).json({
                status: "success",
                data: "Track 3",
                name: "Artificial Intelligence and Graphics",
              });
            } else {
              res.status(200).json({
                status: "success",
                data: "Track 1",
                name: "Software Development",
              });
            }
          } else if (
            CSC241 > 0 &&
            CSC291 > 0 &&
            MTH231 > 0 &&
            MTH262 > 0 &&
            CSC371 > 0
          ) {
            if (CSC241 > 80) {
              res.status(200).json({
                status: "success",
                data: "Track 1",
                name: "Software Development",
              });
            } else if (MTH231 + MTH262 > CSC241 + CSC291 && CSC371 < 75) {
              res.status(200).json({
                status: "success",
                data: "Track 3",
                name: "Artificial Intelligence and Graphics",
              });
            } else if (MTH231 + MTH262 <= CSC241 + CSC291 && CSC371 < 75) {
              res.status(200).json({
                status: "success",
                data: "Track 1",
                name: "Software Development",
              });
            } else if (MTH231 + MTH262 <= CSC241 + CSC291 && CSC371 > 75) {
              res.status(200).json({
                status: "success",
                data: "Track 2",
                name: "Database Technologies",
              });
            } else {
              res.status(200).json({
                status: "success",
                data: "Track 2",
                name: "Database Technologies",
              });
            }
          }
        }
      }
    } else {
      res.status(200).json({
        status: "success",
        data: "You can follow your previously choosen track.",
        name: "",
      });
    }
  }
});
