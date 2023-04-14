require("colors");
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
var cors = require('cors');

const userRouter = require("./routers/user");
const errorHandler = require("./middleware/error");

const app = express();

dotenv.config({ path: "./config.env" });


app.use(express.json());
app.use(express.static("public"));
app.use(cors());

(async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    let server = app.listen(3000);

    app.use("/", userRouter);
    app.use((req, res) => {
      res.status(404);
      res.sendFile(path.join(__dirname, "errorPages", "invalidEndpoint.html"));
    });
    app.use(errorHandler);
  } catch (err) {
    console.log("error: " + err);
  }
})();
