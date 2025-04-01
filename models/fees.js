const mongoose = require("mongoose");

const feesSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
            unique: true,
        },
        amountPaid: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        feesHead: {
            type: String,
            enum: ["Tuition", "Transport", "Admission", "Discount", "Other"],
            required: true,
        },
        session: { type: String, required: true }, // Academic session (e.g., "2024-25")
        paymentMethod: {
            type: String,
            enum: ["Cash", "Card", "UPI", "Bank Transfer"],
            required: true,
        },
        remarks: { type: String, trim: true }, // Optional field for notes
    },
    { timestamps: true }
);

// Ensure `studentId` has an index for better query performance
feesSchema.index({ studentId: 1 });

const Fees = mongoose.model("Fees", feesSchema);
module.exports = Fees;
