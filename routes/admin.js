const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Student = require("../models/student");
const auth = require("../middleware/auth");

// Get student details
router.get("/students", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).lean().exec();
        if (user.role !== "admin") {
            res.status(400).json({ error: "Only admin access allowed" });
        }
        const students = await Student.find().select("name admNumber studentClass dob").lean();
        res.status(200).json({ students });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/student/:admNumber", async (req, res) => {
    try {
        const studentDetails = await Student.findOne({ admNumber: req.params.admNumber });
        if (!studentDetails) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.status(200).json({ studentDetails });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
