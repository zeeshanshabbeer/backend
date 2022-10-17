const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = mongoose.connect(process.env.DATABASE, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("connected");
  } catch (error) {
    console.log(`error: ${error.message}`);
    process.exit(1);
  }
};
module.exports = connectDb;
