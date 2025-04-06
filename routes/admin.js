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

        // Fetch student details
        const studentDetails = await Student.findOne({ admNumber });
        if (!studentDetails) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Fetch fee records using admNumber
        const feesRecords = await Fees.find({ admNumber }).lean();

        res.status(200).json({ studentDetails, feesRecords });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/student/:admNumber", auth, async (req, res) => {
    try {
        const { admNumber } = req.params;
        const { aadhaarNumber, siblings, ...updateData } = req.body;

        // Check if Aadhaar is provided and ensure uniqueness
        if (aadhaarNumber && aadhaarNumber.trim() !== "") {
            const existingStudent = await Student.findOne({
                aadhaarNumber,
                admNumber: { $ne: admNumber }, // Ensure it's not the same student
            });

            if (existingStudent) {
                return res.status(400).json({ error: "Aadhaar number must be unique" });
            }
        }

        // Ensure `siblings` is formatted correctly
        if (typeof siblings === "string") {
            updateData.siblings = siblings.split(",").map((name) => ({
                name: name.trim(),
                regNumber: null, // Default to null, unless frontend sends objects
            }));
        } else if (Array.isArray(siblings)) {
            updateData.siblings = siblings; // Keep existing regNumber values
        }

        // Perform Update
        const updatedStudent = await Student.findOneAndUpdate(
            { admNumber },
            { $set: updateData },
            { new: true, runValidators: true, upsert: false }
        );

        if (!updatedStudent) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.status(200).json({ student: updatedStudent });
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
            return res.status(400).json({ errorMsg: "All required fields must be provided" });
        }

        // Check if student exists
        const studentExists = await Student.exists({ admNumber });
        if (!studentExists) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Create new fee record with admNumber instead of studentId
        const newFee = new Fees({
            admNumber,
            amountPaid,
            feesHead,
            session,
            paymentMethod,
            remarks,
        });

        // Save to database
        await newFee.save();

        res.status(201).json({ fee: newFee, successMsg: "Fees added successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
