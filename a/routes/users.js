const router = require("express").Router();
const User = require("../models/User");

/* =========================
   👥 GET ALL USERS (EXCEPT ME)
========================= */
router.get("/", async (req, res) => {
  try {
    const me = req.query.me;

    const users = await User.find(
      { _id: { $ne: me } },
      { password: 0 } // never send password
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to load users" });
  }
});

/* =========================
   👤 GET USER PROFILE
========================= */
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Profile load failed" });
  }
});

/* =========================
   💰 GET MY WALLET BALANCE
========================= */
router.get("/wallet/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ error: "Failed to load wallet" });
  }
});

/* =========================
   💳 RECHARGE WALLET (MIN ₹50)
========================= */
router.post("/wallet/recharge", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const MIN_RECHARGE = 50;

    if (!userId || typeof amount !== "number") {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (amount < MIN_RECHARGE) {
      return res.status(400).json({
        error: `Minimum recharge is ₹${MIN_RECHARGE}`
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.wallet += amount;
    await user.save();

    res.json({
      wallet: user.wallet,
      message: `₹${amount} added successfully`
    });
  } catch (err) {
    res.status(500).json({ error: "Wallet recharge failed" });
  }
});

/* =========================
   💸 DEDUCT WALLET (CALL END)
========================= */
router.post("/wallet/deduct", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid deduction request" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.wallet < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    user.wallet -= amount;
    await user.save();

    res.json({ wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ error: "Wallet deduction failed" });
  }
});

module.exports = router;
