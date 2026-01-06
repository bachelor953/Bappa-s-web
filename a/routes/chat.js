const router = require("express").Router();
const Message = require("../models/Message");

// 🔹 save message (REST fallback, socket ছাড়াও)
router.post("/", async (req, res) => {
  try {
    const msg = new Message(req.body);
    await msg.save();
    res.json(msg);
  } catch (e) {
    res.status(500).json({ error: "Message save failed" });
  }
});

// 🔹 get chat history between 2 users + MARK SEEN
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    // ============================
    // ⭐ STEP 3: MARK AS SEEN
    // ============================
    // user1 = আমি (chat খুলেছি)
    // user2 = সে (যে message পাঠিয়েছে)
    await Message.updateMany(
      {
        senderId: user2,
        receiverId: user1,
        status: "delivered"
      },
      {
        $set: { status: "seen" }
      }
    );
    // ============================

    // 🔹 now load full chat history
    const msgs = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 });

    res.json(msgs);
  } catch (e) {
    res.status(500).json({ error: "History load failed" });
  }
});

module.exports = router;
