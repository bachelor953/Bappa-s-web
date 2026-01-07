const router = require("express").Router();
const Post = require("../models/Post");

/* =====================
   CREATE POST
===================== */
router.post("/", async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "Invalid post data" });
    }

    const post = new Post({
      userId,
      text
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Post failed" });
  }
});

/* =====================
   GET FEED (WITH USER NAME)
===================== */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name")               // 👤 poster name
      .populate("comments.userId", "name")     // 💬 commenter name
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Feed load failed" });
  }
});

module.exports = router;
