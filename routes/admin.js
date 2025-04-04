const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Student = require("../models/student");
const Fees = require("../models/fees");
const auth = require("../middleware/auth");

// Get student details
router.get("/students", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).lean().exec();
        if (user.role !== "admin") {
            res.status(400).json({ error: "Only admin access allowed" });
        }
        const students = await Student.find()
            .select("name admNumber studentClass dob rte studying")
            .lean();
        res.status(200).json({ students });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/student/:admNumber", async (req, res) => {
    try {
        const { admNumber } = req.params;

        const studentDetails = await Student.findOne({ admNumber });
        if (!studentDetails) {
            return res.status(404).json({ error: "Student not found" });
        }

        const feesRecords = await Fees.find({
            studentId: studentDetails._id,
        }).lean();

        res.status(200).json({ studentDetails, feesRecords });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/fees/:admNumber", auth, async (req, res) => {
    try {
        const { admNumber } = req.params;
        const { amountPaid, feesHead, session, paymentMethod, remarks } = req.body;

        // Validate required fields
        if (!amountPaid || !feesHead || !session || !paymentMethod) {
            return res.status(400).json({ error: "All required fields must be provided" });
        }

        // Check if student exists
        const student = await Student.findOne({ admNumber });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Create new fee record
        const newFee = new Fees({
            studentId: student._id,
            amountPaid,
            feesHead,
            session,
            paymentMethod,
            remarks,
        });

        // Save to database
        await newFee.save();

        res.status(201).json({ fee: newFee });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
