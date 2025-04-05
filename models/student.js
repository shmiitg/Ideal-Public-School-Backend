const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        dob: { type: Date, required: true },
        aadhaarNumber: { type: String, sparse: true, trim: true },
        nameAadhaar: { type: String, trim: true },
        regNumber: { type: Number, sparse: true },
        admNumber: { type: String, required: true, trim: true },
        pen: { type: String, trim: true },
        studentClass: { type: String, required: true, trim: true },
        fatherDetails: {
            name: { type: String, trim: true, required: true },
            occupation: { type: String, trim: true },
        },
        motherDetails: {
            name: { type: String, trim: true, required: true },
            qualification: { type: String, trim: true },
        },
        // 👇 Updated from enum to plain number
        annualIncome: { type: Number, required: true },

        address: { type: String, required: true, trim: true },
        contactDetails: {
            primary: { type: String, required: true, trim: true },
            secondary: { type: String, trim: true },
        },
        lastSchoolAttended: { type: String, trim: true },
        siblings: [{ type: String, trim: true }],
        religion: {
            type: String,
            enum: ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi"],
            required: true,
        },
        caste: { type: String, trim: true },
        category: { type: String, enum: ["General", "OBC", "EWS", "SC", "ST"], required: true },
        transportRequired: { type: String, enum: ["Yes", "No"] },
        studying: { type: String, default: "Yes", enum: ["Yes", "No"] },
        rte: { type: String, default: "No", enum: ["Yes", "No"] },
    },
    { timestamps: true }
);

// Auto-generate admNumber before saving
studentSchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    const today = new Date();
    const ddmmyyyy = `${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${today.getFullYear()}`;

    const prefix = `IPS${ddmmyyyy}`;

    const latestStudent = await mongoose
        .model("Student")
        .findOne({ admNumber: { $regex: `^${prefix}` } })
        .sort({ admNumber: -1 });

    let serialNumber = "001";

    if (latestStudent) {
        const lastSerial = latestStudent.admNumber.slice(-3);
        serialNumber = String(parseInt(lastSerial) + 1).padStart(3, "0");
    }

    this.admNumber = `${prefix}${serialNumber}`;
    next();
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
