const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const batchAdvisorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
    maxLength: [30, "Name should not exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    maxLength: [30, "Email should not exceed 30 characters"],
    unique: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v); // also accept in it
        // return /^\w+([\.-]?\w+)@gmail\.com+$/.test(v); // also accept in it
        // return /^[a-z0-9](\.?[a-z0-9]){5,}@gmail\.com$/.test(v);
      },
      message: "Email incorrect",
    },
  },
  contactNo: {
    type: Number,
    required: [true, "Please enter contact no"],
    // maxLength: [10, "Contact number should contain 11 digits"],
    // minLength: [10, "Contact number should contain 11 digits"],
    validate: {
      validator: function (v) {
        // return /^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/.test(v);  accept XXX-XXX-XXXX OR XXX.XXX.XXXX
        return /^\d{10}$/.test(v);
      },
      message: "ContactNo format XXXXXXXXXX",
    },
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    validate: {
      validator: function (v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(
          v
        );
      },
      message:
        "Password should contain 1 uppercase, 1 lowercase , 1 digit, 1 special c",
    },
  },
  batch: {
    type: String,
    required: [true, "Please enter batch"],
    maxLength: [4, "Batch should be 4 characters long"],
    minLength: [4, "Batch should be 4 characters long"],
  },
  resettoken: {
    type: String,
  },
  expiretoken: {
    type: Date,
  },
});
//hashing the password
batchAdvisorSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
// generating the token
batchAdvisorSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};
// create the collection in database
const BatchAdvisor = mongoose.model("BatchAdvisor", batchAdvisorSchema);
module.exports = BatchAdvisor;
