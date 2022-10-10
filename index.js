const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const app = require("./app");

const connectDb = require("./config/db");
connectDb();

const port = process.env.PORT || 6000;
app.listen(port, () => {
  console.log(`connect ${port}`);
});
