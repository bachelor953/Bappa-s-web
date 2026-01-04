const router = require("express").Router();
const Post = require("../models/Post");

// CREATE POST
router.post("/", async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIKE
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.likes.push(req.body.userId);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// COMMENT
router.post("/comment/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({
      userId: req.body.userId,
      text: req.body.text
    });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
