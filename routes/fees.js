const express = require("express");
const router = express.Router();
const Fees = require("../models/fees");

router.get("/:receiptNumber", async (req, res) => {
    try {
        const { receiptNumber } = req.params;

        const fee = await Fees.findOne({ receiptNumber });

        if (!fee) {
            return res.status(404).json({ error: "Fee record not found" });
        }

        res.status(200).json({ fee });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
