require("dotenv").config();
const express = require("express");
const cors = require("cors");

const studentRouter = require("./routes/student");

require("./config/db");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root Route - Show a message
app.get("/", (req, res) => {
    res.send("Welcome to the Ideal Public School Backend!");
});

app.use("/student", studentRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running at port ${port}`));
