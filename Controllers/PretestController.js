const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Pretest = require("../models/PretestModel");
const PendingAddCourse = require("../models/pendingAddCourseModel");

//------------------------PRETEST IN ADD COURSE------------------
//add questions
exports.Add_Question = catchAsync(async (req, res, next) => {
  const {
    courseCode,
    courseName,
    question,
    option1,
    option2,
    option3,
    option4,
    correct_answer,
  } = req.body;
  if (
    option1 === correct_answer ||
    option2 === correct_answer ||
    option3 === correct_answer ||
    option4 === correct_answer ||
    option1 != option2 ||
    option1 != option3 ||
    option1 != option4 ||
    option2 != option3 ||
    option2 != option4 ||
    option3 != option4
  ) {
    const record = await Pretest.findOne({ courseCode });
    if (!record) {
      const add = new Pretest({
        courseCode,
        courseName,
      });
      await add.add_question(
        question,
        option1,
        option2,
        option3,
        option4,
        correct_answer
      );
      await add.save();
      res.status(200).json({
        status: "success",
        message: "Upload Question Successfully",
      });
      // res.send(add);
    }
    await record.add_question(
      question,
      option1,
      option2,
      option3,
      option4,
      correct_answer
    );
    await record.save();
    res.status(200).json({
      status: "success",
      message: "Upload Question Successfully",
    });
    // res.send(record);
  } else {
    return next(new AppError("Enter the correct option and answer", 400));
    // res.status(400).send("enter the correct option and answer");
  }
});
//get questions
exports.getQuestions = catchAsync(async (req, res, next) => {
  const { courseName } = req.params;

  // console.log(courseName);
  // const courseCode="123"
  const question = await Pretest.findOne({ courseName });
  if (!question) {
    return next(new AppError("Please enter correct CourseCode", 400));
  } else {
    console.log(question);
    res.status(200).json({
      status: "success",
      message: question.questions,
    });
  }
});
//verify the answers
exports.verifyAnswer = catchAsync(async (req, res, next) => {
  const { answer } = req.body;

  console.log(answer);
  const { courseName } = req.params;
  const { registrationId } = req.rootuser;
  const record = await Pretest.findOne({ courseName });
  if (!record) {
    return next(new AppError("Please enter correct CourseName", 400));
  } else {
    let marks = 0;
    for (let i = 0; i < answer.length; i++) {
      for (let j = 0; j < record.questions.length; j++) {
        if (record.questions[j].question === answer[i].question) {
          if (record.questions[j].correct_answer === answer[i].correct_answer) {
            console.log(" 1");
            marks = marks + 1;
          }
        }
      }
    }
    const pendingCourses = await PendingAddCourse.findOne({ registrationId });
    for (let i = 0; i < pendingCourses.courses.length; i++) {
      if (pendingCourses.courses[i].preReqCourse === courseName) {
        pendingCourses.courses[i].preTest = marks;
        await pendingCourses.save();
      }
    }
    console.log(marks);
    res.status(200).json({
      status: "success",
      message: marks,
    });
  }

  // for(let i=0;i<record.questions.length;i++){
  //   if(record.questions[i].correct_answer===answer[0] ||
  //      record.questions[i].correct_answer===answer[1] ||
  //      record.questions[i].correct_answer===answer[2] ||
  //      record.questions[i].correct_answer===answer[3] ||
  //      record.questions[i].correct_answer===answer[4] ||
  //      record.questions[i].correct_answer===answer[5] ||
  //      record.questions[i].correct_answer===answer[6] ||
  //      record.questions[i].correct_answer===answer[7] ||
  //      record.questions[i].correct_answer===answer[8] ||
  //      record.questions[i].correct_answer===answer[9] ||
  //      record.questions[i].correct_answer===answer[10]){
  //       console.log(marks);
  //      }else{
  //       marks=marks-1;
  //      }
  // }
});
//pretest upload data
exports.UploadPreTestData = catchAsync(async (req, res, next) => {
  const student = await Pretest.create(req.body);
  res.status(200).json({
    status: "success",
    message: "Upload test Successfully",
  });
  // res.status(200).send(student);
});
