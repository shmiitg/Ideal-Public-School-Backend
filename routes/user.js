const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// Get user details
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).lean().exec();
        res.json({ email: user.email, role: user.role });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
