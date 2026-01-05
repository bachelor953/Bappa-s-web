const router = require("express").Router();
const User = require("../models/User");

// GET all users except me
router.get("/", async (req, res) => {
  try {
    const me = req.query.me; // my userId
    const users = await User.find(
      { _id: { $ne: me } },
      { password: 0 } // password পাঠাবো না
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to load users" });
  }
});

module.exports = router;
