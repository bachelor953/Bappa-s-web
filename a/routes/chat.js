const router = require("express").Router();
const Message = require("../models/Message");

// send message (save)
router.post("/", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

// get chat history
router.get("/:user1/:user2", async (req, res) => {
  const msgs = await Message.find({
    $or: [
      { senderId: req.params.user1, receiverId: req.params.user2 },
      { senderId: req.params.user2, receiverId: req.params.user1 }
    ]
  });
  res.json(msgs);
});

module.exports = router;
