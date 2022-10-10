const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Timetable = require("./routes/timetableRouter");
const SechemeOfStudy = require("./routes/SechemeOfStudyRouter");
const DegreePlanner = require("./routes/DegreePlannerRouter");
const ChatBox = require("./routes/ChatBoxRouter");
const PretestController = require("./routes/PretestRouter");
const PastpaperController = require("./routes/PastpaperRouter");
const OfficeHoursController = require("./routes/OfficeHoursRouter");
const GuidanceController = require("./routes/GuidanceRouter");
const FreezeSemesterController = require("./routes/FreezeSemesterRouter");
const RepeatCourseController = require("./routes/RepeatCourseRouter");
const DropCourseController = require("./routes/DropCourseRouter");
const BatchAdvisorController = require("./routes/BatchAdvisorRouter");
const ApprovedRequestController = require("./routes/ApprovedRequestRouter");
const AddCourseController = require("./routes/AddCourseRouter");
const StudentInformation = require("./routes/StudentInformationRouter");
const Student = require("./routes/StudentRouter");
const Pending = require("./routes/PendingAddCourseRouter");
const Notification = require("./routes/NotificationRouter");
const globalErrorHandler = require("./Controllers/errorController");

const app = express();
app.use(express.json());
app.use(cookieParser());
// const corsOptions = {
//   origin: "*",
//   methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
//   optionsSuccessStatus: 200,
// };
app.use(cors());
// Student Router
app.use("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Deleted Successfully",
  });
});
app.use("/Student", Student);
//BatchAdvisorController
app.use("/BatchAdvisor", BatchAdvisorController);
// S_ChatBoxController
app.use("/ChatBox", ChatBox);
// Timetable router
app.use("/Timetable", Timetable);
// SechemeOfStudyController
app.use("/SechemeOfStudy", SechemeOfStudy);
// DegreePlanner
app.use("/DegreePlanner", DegreePlanner);
// PretestController
app.use("/Pretest", PretestController);
// RepeatCourseController
app.use("/RepeatCourse", RepeatCourseController);

// OfficeHoursController
app.use("/OfficeHours", OfficeHoursController);
// FreezeSemesterController
app.use("/FreezeSemester", FreezeSemesterController);
// Student Information
app.use("/StudentInformation", StudentInformation);
// ApprovedRequestController
app.use("/ApprovedRequest", ApprovedRequestController);
// Pending AddCourse Router
app.use("/PendingAddCourse", Pending);
// PastPaperController
app.use("/Pastpaper", PastpaperController);
// GuidanceController
app.use("/Guidance", GuidanceController);
// DropCourseController
app.use("/DropCourse", DropCourseController);
// AddCourseController
app.use("/AddCourse", AddCourseController);
// NotificationController
app.use("/Notification", Notification);
// global error handle
app.use(globalErrorHandler);

module.exports = app;
