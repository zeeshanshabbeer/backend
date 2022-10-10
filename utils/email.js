const nodemailer = require("nodemailer");
const sendEmail = (data) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });
  const mailOptions = {
    from: process.env.USER,
    to: data.to,
    subject: data.subject, 
    html: data.html,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log("Error Ocuured " + err);
    } else {
      console.log("Email Send Successfully" + info.response);
    }
  });
};

module.exports = sendEmail;
