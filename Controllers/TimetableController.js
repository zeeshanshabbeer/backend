const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Timetable = require("../models/TimetableModel");
const SOS = require("../models/SchemeOfStudyModel");
const ElectiveCourse = require("../models/ElectiveCoursesModel");
const PendingAddCourse = require("../models/pendingAddCourseModel");

//---------------------------------------Timetable clashes-----------------------

//upload timetable
exports.timetable = catchAsync(async (req, res, next) => {
  const timetable = await Timetable.create(req.body);
  res.status(200).json({
    status: "success",
    message: "Timetable Uploaded Successfully",
  });
});
// Step 1: collect student courses that he is studying this semester
// Step 2: timetable ma sa in ki slot fetch kerna aur kisi array ma store kerva dena or repeated course ki bi
// Step 3: jo course is na add kerna is ki slot utha leni timetable sa
// Step 4: Semester fetch kerna kis semester ko ya course perhaya ja raha  ha//  SOS sa bi semestere utha sakhta hain
// Step 5: compare student courses slot with / add course slot
exports.TimetableClashes = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { subject } = req.params;
  const { semester, registrationId } = user;
  if (semester === 1) {
    const final_sections = [];
    res.status(200).json({
      status: "success",
      message: final_sections,
    });
    // res.send(final_sections);
  } else if (semester === 2) {
    // store student courses in student_courses array
    const data1 = req.rootuserSemester2;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      // now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable record found", 400));
      }
      // store slots in array
      // First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      // find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      // compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      // res.json(final_sections);
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
      // res.json(final_sections);
    }
  } else if (semester === 3) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester3;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable Found", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 4) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester4;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 5) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester5;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 6) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester6;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            // console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 7) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester7;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 8) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester8;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }

      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 9) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester9;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 10) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester10;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 11) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester11;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("No Timetable", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  } else if (semester === 12) {
    //store student courses in student_courses array
    const data1 = req.rootuserSemester12;
    let data = [];
    const data2 = await PendingAddCourse.findOne({ registrationId });
    if (data2) {
      data = data1.concat(data2);
    } else {
      data = data1;
    }
    if (data.length != 0) {
      let student_courses = [];
      for (let i = 0; i < data.length; i++) {
        student_courses.push({
          courseName: data[i].courseName,
          section: data[i].courseSection, //here we get section
        });
      }
      //now fetch the slot of these courses that student current enrolled or pending
      let student_courses1 = []; //array for slot store
      const schedule = await Timetable.find();
      if (!schedule) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no Timetable");
      }
      //store slots in array
      //First check section of each course then get the slot
      for (let i = 0; i < student_courses.length; i++) {
        for (let j = 0; j < schedule.length; j++) {
          if (student_courses[i].section === schedule[j].class) {
            for (let k = 0; k < schedule[j].timetable[0].Monday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Monday[k].courseName
              ) {
                student_courses1.push({
                  courseName: student_courses[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Monday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Tuesday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Tuesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Tuesday[k].slot,
                });
              }
            }

            for (
              let k = 0;
              k < schedule[j].timetable[0].Wednesday.length;
              k++
            ) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Wednesday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Wednesday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Thursday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Thursday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Thursday[k].slot,
                });
              }
            }
            for (let k = 0; k < schedule[j].timetable[0].Friday.length; k++) {
              if (
                student_courses[i].courseName ===
                schedule[j].timetable[0].Friday[k].courseName
              ) {
                student_courses1.push({
                  courseName: data[i].courseName,
                  section: student_courses[i].section, //here we get section
                  slot: schedule[j].timetable[0].Friday[k].slot,
                });
              }
            }
          }
        }
      }
      //-------add course=> in which semester this course alot---
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }
      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //store slot of add course of every section
      let sec_A = [];
      let sec_B = [];
      // let sec_C = [];
      for (let i = 0; i < record.length; i++) {
        for (let j = 0; j < record[i].timetable[0].Monday.length; j++) {
          if (record[i].timetable[0].Monday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Monday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Monday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Tuesday.length; j++) {
          if (record[i].timetable[0].Tuesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Tuesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Tuesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Wednesday.length; j++) {
          if (record[i].timetable[0].Wednesday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Wednesday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Wednesday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Thursday.length; j++) {
          if (record[i].timetable[0].Thursday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Thursday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Thursday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
        for (let j = 0; j < record[i].timetable[0].Friday.length; j++) {
          if (record[i].timetable[0].Friday[j].courseName === subject) {
            if (record[i].section === "A") {
              sec_A.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            if (record[i].section === "B") {
              sec_B.push({
                slot: record[i].timetable[0].Friday[j].slot,
                class: record[i].class,
              });
            }
            // if (record[i].section === "C") {
            //   sec_C.push({
            //     slot: record[i].timetable[0].Friday[j].slot,
            //     class: record[i].class,
            //   });
            // }
          }
        }
      }
      //compare the slot for clashes
      let Clash_sec_A = "";
      let Clash_sec_B = "";
      // let Clash_sec_C = "";
      if (sec_A != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_A.length; j++) {
            if (student_courses1[i].slot === sec_A[j].slot) {
              Clash_sec_A = 1;
            }
          }
        }
      }
      if (sec_B != false) {
        for (let i = 0; i < student_courses1.length; i++) {
          for (let j = 0; j < sec_B.length; j++) {
            console.log(student_courses1[i].slot, sec_B[j].slot);
            if (student_courses1[i].slot === sec_B[j].slot) {
              Clash_sec_B = 1;
            }
          }
        }
      }
      // if (sec_C != false) {
      //   for (let i = 0; i < student_courses1.length; i++) {
      //     for (let j = 0; j < sec_C.length; j++) {
      //       if (student_courses1[i].slot === sec_C[j].slot) {
      //         Clash_sec_C = 1;
      //       }
      //     }
      //   }
      // }
      let final_sections = [];
      if (Clash_sec_A === "") {
        if (sec_A != false) {
          final_sections.push(sec_A[0].class);
        }
      }
      if (Clash_sec_B === "") {
        if (sec_B != false) {
          final_sections.push(sec_B[0].class);
        }
      }
      // if (Clash_sec_C === "") {
      //   if (sec_C != false) {
      //     final_sections.push(sec_C[0].class);
      //   }
      // }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    } else {
      let add_course_semester = "";
      const sos_cour = await SOS.find();
      const elec_cour = await ElectiveCourse.find();
      const courses = sos_cour.concat(elec_cour);
      if (!courses) {
        return next(new AppError("no courses in SOS", 400));
        // res.send("no courses in SOS");
      }
      for (let i = 0; i < courses.length; i++) {
        if (courses[i].courseName === subject) {
          add_course_semester = courses[i].semester;
        }
      }

      //find all timetables of add_course_semester
      const record = await Timetable.find({ semester: add_course_semester });
      if (!record) {
        return next(
          new AppError("no record found of semester add course", 400)
        );
        // res.send("no record found of semester add course");
      }
      //find the section
      let final_sections = [];
      for (let i = 0; i < record.length; i++) {
        final_sections.push(record[i].class);
      }
      res.status(200).json({
        status: "success",
        message: final_sections,
      });
    }
  }
});

//--------------------------student current timetable-------------------
//-------------------------------show student timetable------------------
// 1. in which semester student currently enrolled
//2. collect courses in which student currently enrolled or drop pending
//3. also collect courseSection,courseName
//4. get the timetable
//5. for every course ==> check in which which section and pick the slots of that courses
//6. display all the time slots

exports.StudentTimetable = catchAsync(async (req, res, next) => {
  const user = req.rootuser;
  const { semester } = user;
  if (semester === 1) {
    const StudentCourses = user.Result[0].Semester1;
    // push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    // get all the timetable
    const timetable = await Timetable.find();
    // get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
            }
          }
        }
      }
    }
    // arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
    // res.send(studentCourseTimetable);
  } else if (semester === 2) {
    const StudentCourses = user.Result[0].Semester2;
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 3) {
    const StudentCourses = user.Result[0].Semester3;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 4) {
    const StudentCourses = user.Result[0].Semester4;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 5) {
    const StudentCourses = user.Result[0].Semester5;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    console.log(stdCour)
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 6) {
    const StudentCourses = user.Result[0].Semester6;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 7) {
    const StudentCourses = user.Result[0].Semester7;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 8) {
    const StudentCourses = user.Result[0].Semester8;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 9) {
    const StudentCourses = user.Result[0].Semester9;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 10) {
    const StudentCourses = user.Result[0].Semester10;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 11) {
    const StudentCourses = user.Result[0].Semester11;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  } else if (semester === 12) {
    const StudentCourses = user.Result[0].Semester12;
    // res.send(StudentCourses);
    //push courses in array in which studen enrolled or drop pending status
    let stdCour = [];
    for (let i = 0; i < StudentCourses.length; i++) {
      if (
        StudentCourses[i].status === "enrolled" ||
        StudentCourses[i].status === "Drop Pending"
      ) {
        stdCour.push({
          courseCode: StudentCourses[i].courseCode,
          courseName: StudentCourses[i].courseName,
          courseSection: StudentCourses[i].courseSection,
        });
      }
    }
    //get all the timetable
    const timetable = await Timetable.find();
    // res.send(timetable);
    //get slot in which slot he/she wil study
    let timetableSlot = [];
    for (let i = 0; i < stdCour.length; i++) {
      for (let j = 0; j < timetable.length; j++) {
        if (stdCour[i].courseSection === timetable[j].class) {
          for (let k = 0; k < timetable[j].timetable[0].Monday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Monday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Monday",
                courseName: timetable[j].timetable[0].Monday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Monday[k].classTime,
                classRoom: timetable[j].timetable[0].Monday[k].classRoom,
                slot: timetable[j].timetable[0].Monday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Monday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Tuesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Tuesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Tuesday",
                courseName: timetable[j].timetable[0].Tuesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Tuesday[k].classTime,
                classRoom: timetable[j].timetable[0].Tuesday[k].classRoom,
                slot: timetable[j].timetable[0].Tuesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Tuesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Wednesday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Wednesday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Wednesday",
                courseName: timetable[j].timetable[0].Wednesday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Wednesday[k].classTime,
                classRoom: timetable[j].timetable[0].Wednesday[k].classRoom,
                slot: timetable[j].timetable[0].Wednesday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Wednesday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Thursday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Thursday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Thursday",
                courseName: timetable[j].timetable[0].Thursday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Thursday[k].classTime,
                classRoom: timetable[j].timetable[0].Thursday[k].classRoom,
                slot: timetable[j].timetable[0].Thursday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Thursday[k].slot);
            }
          }
          for (let k = 0; k < timetable[j].timetable[0].Friday.length; k++) {
            if (
              stdCour[i].courseName ===
              timetable[j].timetable[0].Friday[k].courseName
            ) {
              timetableSlot.push({
                Day: "Friday",
                courseName: timetable[j].timetable[0].Friday[k].courseName,
                courseSection: stdCour[i].courseSection,
                classTime: timetable[j].timetable[0].Friday[k].classTime,
                classRoom: timetable[j].timetable[0].Friday[k].classRoom,
                slot: timetable[j].timetable[0].Friday[k].slot,
              });
              // res.send(timetable[j].timetable[0].Friday[k].slot);
            }
          }
        }
      }
    }
    //arrange that monday slot at position 0....
    let studentCourseTimetable = [];
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "M1" ||
        timetableSlot[i].slot === "M2" ||
        timetableSlot[i].slot === "M3" ||
        timetableSlot[i].slot === "M4" ||
        timetableSlot[i].slot === "M5" ||
        timetableSlot[i].slot === "M6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "T1" ||
        timetableSlot[i].slot === "T2" ||
        timetableSlot[i].slot === "T3" ||
        timetableSlot[i].slot === "T4" ||
        timetableSlot[i].slot === "T5" ||
        timetableSlot[i].slot === "T6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "W1" ||
        timetableSlot[i].slot === "W2" ||
        timetableSlot[i].slot === "W3" ||
        timetableSlot[i].slot === "W4" ||
        timetableSlot[i].slot === "W5" ||
        timetableSlot[i].slot === "W6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "Th1" ||
        timetableSlot[i].slot === "Th2" ||
        timetableSlot[i].slot === "Th3" ||
        timetableSlot[i].slot === "Th4" ||
        timetableSlot[i].slot === "Th5" ||
        timetableSlot[i].slot === "Th6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    for (let i = 0; i < timetableSlot.length; i++) {
      if (
        timetableSlot[i].slot === "F1" ||
        timetableSlot[i].slot === "F2" ||
        timetableSlot[i].slot === "F3" ||
        timetableSlot[i].slot === "F4" ||
        timetableSlot[i].slot === "F5" ||
        timetableSlot[i].slot === "F6"
      ) {
        studentCourseTimetable.push({
          Day: timetableSlot[i].Day,
          courseName: timetableSlot[i].courseName,
          courseSection: timetableSlot[i].courseSection,
          classTime: timetableSlot[i].classTime,
          classRoom: timetableSlot[i].classRoom,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: studentCourseTimetable,
    });
  }
});
