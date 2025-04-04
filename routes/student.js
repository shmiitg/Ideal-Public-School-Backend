const express = require("express");
const router = express.Router();
const Student = require("../models/student");

// Fetch Student Details via Aadhaar & DOB
router.get("/registration", async (req, res) => {
    try {
        const { admNumber, dob } = req.query;

        if (!admNumber || !dob) {
            return res.status(400).json({ error: "Admission number and DOB are required" });
        }

        const studentDetails = await Student.findOne({ admNumber, dob }).lean();
        if (!studentDetails) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.status(200).json({ studentDetails });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Save New Student Details
router.post("/registration", async (req, res) => {
    try {
        const { name, dob, aadhaarNumber, siblings } = req.body;

        // Required Fields Validation
        if (!name || !dob) {
            return res.status(400).json({ error: "Name and DOB are required" });
        }

        // Check for Duplicate Aadhaar Number (unless it's "999999999999" or empty)
        if (aadhaarNumber && aadhaarNumber !== "999999999999" && aadhaarNumber.trim() !== "") {
            const existingStudent = await Student.findOne({ aadhaarNumber }).lean();
            if (existingStudent) {
                return res.status(400).json({ error: "Student with this Aadhaar already exists" });
            }
        }

        // Generate Unique Admission Number (IPSddmmyyyyXXX)
        const today = new Date();
        const datePart = `${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${today.getFullYear()}`;

        const lastStudent = await Student.findOne({}, { admNumber: 1 }).sort({ _id: -1 }).lean();
        let lastSerialNumber = 0;

        if (lastStudent && lastStudent.admNumber.startsWith(`IPS${datePart}`)) {
            lastSerialNumber = parseInt(lastStudent.admNumber.slice(-3), 10);
        }

        const admNumber = `IPS${datePart}${(lastSerialNumber + 1).toString().padStart(3, "0")}`;

        // Ensure `siblings` is an array
        const formattedSiblings = Array.isArray(siblings) ? siblings : [];

        // Prepare Student Data (Frontend already formatted other fields)
        const studentData = {
            ...req.body, // Keep everything from frontend
            admNumber, // Add generated admission number
            siblings: formattedSiblings, // Ensure correct format
        };

        // Save New Student
        const newStudent = new Student(studentData);
        await newStudent.save();

        res.status(201).json({ student: newStudent });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Update Student Details
router.put("/registration", async (req, res) => {
    try {
        const { admNumber, aadhaarNumber, siblings, ...updateData } = req.body;

        if (!admNumber) {
            return res.status(400).json({ error: "Admission number is required for updates" });
        }

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
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
