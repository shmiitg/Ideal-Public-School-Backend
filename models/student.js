const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        dob: { type: Date, required: true },
        aadhaarNumber: { type: String, sparse: true, trim: true }, // Sparse & Trim
        nameAadhaar: { type: String, trim: true },
        regNumber: { type: Number, sparse: true }, // Sparse (optional unique field)
        admNumber: { type: String, required: true, trim: true }, // Trim added
        pen: { type: String, trim: true },
        studentClass: { type: String, required: true, trim: true }, // Trim added
        fatherDetails: {
            name: { type: String, trim: true, required: true },
            occupation: { type: String, trim: true },
        },
        motherDetails: {
            name: { type: String, trim: true, required: true },
            qualification: { type: String, trim: true },
        },
        annualIncome: {
            type: String,
            enum: [
                "Rs. 0 - 1 lakh",
                "Rs. 1 lakh - 5 lakh",
                "Rs. 5 lakh - 10 lakh",
                "Rs. 10 lakh +",
            ],
            required: true,
        },
        address: { type: String, required: true, trim: true },
        contactDetails: {
            primary: { type: String, required: true, trim: true }, // Trim added
            secondary: { type: String, trim: true }, // Trim added
        },
        lastSchoolAttended: { type: String, trim: true },
        siblings: [
            {
                name: { type: String, trim: true },
                regNumber: { type: Number, sparse: true }, // Sparse added
            },
        ],
        religion: {
            type: String,
            enum: [
                "Hindu",
                "Muslim",
                "Christian",
                "Sikh",
                "Buddhist",
                "Jain",
                "Parsi (Zoroastrian)",
            ],
            required: true,
        },
        caste: { type: String, trim: true },
        category: { type: String, enum: ["General", "OBC", "EWS", "SC", "ST"], required: true },
        transportRequired: { type: String, enum: ["Yes", "No"] },
    },
    { timestamps: true }
);

// 🔹 Auto-generate admNumber before saving
studentSchema.pre("save", async function (next) {
    if (!this.isNew) return next(); // Only generate for new students

    const today = new Date();
    const ddmmyyyy = `${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${today.getFullYear()}`;

    const prefix = `IPS${ddmmyyyy}`;

    // Find the latest admNumber for today
    const latestStudent = await mongoose
        .model("Student")
        .findOne({ admNumber: { $regex: `^${prefix}` } })
        .sort({ admNumber: -1 });

    let serialNumber = "001"; // Default if no students exist today

    if (latestStudent) {
        const lastSerial = latestStudent.admNumber.slice(-3); // Extract last 3 digits
        serialNumber = String(parseInt(lastSerial) + 1).padStart(3, "0"); // Increment and format
    }

    this.admNumber = `${prefix}${serialNumber}`;
    next();
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
