const router = require("express").Router();
const Message = require("../models/Message");

// SEND MESSAGE (save to DB)
router.post("/", async (req, res) => {
  try {
    const msg = new Message({
      senderId: req.body.senderId,
      receiverId: req.body.receiverId,
      text: req.body.text
    });

    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CHAT HISTORY BETWEEN TWO USERS
router.get("/:user1/:user2", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        {
          senderId: req.params.user1,
          receiverId: req.params.user2
        },
        {
          senderId: req.params.user2,
          receiverId: req.params.user1
        }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
