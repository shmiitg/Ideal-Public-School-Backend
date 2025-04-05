const mongoose = require("mongoose");

const feesSchema = new mongoose.Schema(
    {
        admNumber: {
            type: String,
            required: true,
            index: true,
        },
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
            unique: true,
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
            type: String,
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

feesSchema.index({ admNumber: 1, session: 1 });
feesSchema.index({ admNumber: 1 });
feesSchema.index({ session: 1 });

const Fees = mongoose.model("Fees", feesSchema);
module.exports = Fees;
