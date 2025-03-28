const express = require("express");
const router = express.Router();
const Student = require("../models/student");

// Fetch Student Details via Aadhaar & DOB
router.get("/registration", async (req, res) => {
    try {
        const { admNumber, dob } = req.query;

        if (!admNumber || !dob) {
            return res.status(400).json({ msg: "Admission number and DOB are required" });
        }
        const studentDetails = await Student.findOne({ admNumber, dob }).lean();
        if (!studentDetails) {
            return res.status(404).json({ msg: "Student not found" });
        }

        res.status(200).json({ studentDetails });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// Save New Student Details
router.post("/registration", async (req, res) => {
    try {
        const { name, dob, aadhaarNumber, siblings } = req.body;

        // Required Fields Validation
        if (!name || !dob || !aadhaarNumber) {
            return res.status(400).json({ msg: "Name, DOB, and Aadhaar number are required" });
        }

        // Check for Duplicate Aadhaar Number
        const existingStudent = await Student.findOne({ aadhaarNumber }).lean();
        if (existingStudent) {
            return res.status(400).json({ msg: "Student with this Aadhaar already exists" });
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

        res.status(201).json({ msg: "Student registered successfully", student: newStudent });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

router.put("/registration", async (req, res) => {
    try {
        const { admNumber, aadhaarNumber, siblings, ...updateData } = req.body;

        if (!admNumber) {
            return res.status(400).json({ msg: "Admission number is required for updates" });
        }

        // Check if Aadhaar is being updated & ensure uniqueness
        if (aadhaarNumber) {
            const existingStudent = await Student.findOne({
                aadhaarNumber,
                admNumber: { $ne: admNumber }, // Ensure it's not the same student
            });

            if (existingStudent) {
                return res
                    .status(400)
                    .json({ msg: "Aadhaar number already exists for another student" });
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
        ).setOptions({ overwrite: false });

        if (!updatedStudent) {
            return res.status(404).json({ msg: "Student not found" });
        }

        res.status(200).json({ msg: "Student updated successfully", student: updatedStudent });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
