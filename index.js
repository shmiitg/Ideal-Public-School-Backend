require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const studentRouter = require("./routes/student");
const adminRouter = require("./routes/admin");

require("./config/db");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root Route - Show a message
app.get("/", (req, res) => {
    res.send("Welcome to the Ideal Public School Backend!");
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/student", studentRouter);
app.use("/admin", adminRouter);

// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log(`Server running at port ${port}`));

module.exports = app;
