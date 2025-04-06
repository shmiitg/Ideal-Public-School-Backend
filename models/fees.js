const mongoose = require("mongoose");

// Counter Schema for session-based auto-increment
const counterSchema = new mongoose.Schema({
    session: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("ReceiptCounter", counterSchema);

// Fees Schema
const feesSchema = new mongoose.Schema(
    {
        admNumber: {
            type: String,
            required: true,
            index: true,
        },
        receiptNumber: {
            type: String,
            unique: true,
            immutable: true,
        },
        amountPaid: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        feesHead: {
            type: String,
            enum: ["Tuition", "Transport", "Admission", "Discount", "Other"],
            required: true,
        },
        session: {
            type: String, // Format: "2025-26"
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["Cash", "UPI", "Bank Transfer"],
            required: true,
        },
        remarks: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Indexes for optimization
feesSchema.index({ admNumber: 1, session: 1 });
feesSchema.index({ session: 1 });

// Pre-save hook to generate receiptNumber
feesSchema.pre("save", async function (next) {
    if (this.isNew && !this.receiptNumber) {
        const sessionCode = this.session.replace(/[^0-9]/g, ""); // e.g., "2025-26" => "202526"

        const counter = await Counter.findOneAndUpdate(
            { session: this.session },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const paddedSeq = String(counter.seq).padStart(4, "0"); // e.g., 1 => "0001"
        this.receiptNumber = `FEE${sessionCode}${paddedSeq}`;
    }
    next();
});

const Fees = mongoose.model("Fees", feesSchema);
module.exports = Fees;
