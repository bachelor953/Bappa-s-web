const router = require("express").Router();
const Post = require("../models/Post");

/* =========================
   📝 CREATE POST
========================= */
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
    res.status(500).json({ error: "Post creation failed" });
  }
});

/* =========================
   📰 GET FEED (WITH USER NAME)
========================= */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name") // 🔥 show user name in feed
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Feed load failed" });
  }
});

/* =========================
   ❤️ LIKE / UNLIKE POST
========================= */
router.put("/like/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // toggle like
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Like failed" });
  }
});

/* =========================
   💬 COMMENT ON POST
========================= */
router.post("/comment/:id", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!userId || !text) {
      return res.status(400).json({ error: "Invalid comment" });
    }

    post.comments.push({ userId, text });
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Comment failed" });
  }
});

module.exports = router;
