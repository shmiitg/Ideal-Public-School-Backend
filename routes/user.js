const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// Get user details
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).lean().exec();
        res.status(200).json({ email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
