const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/register", upload.single("photo"), async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashed,
    photo: req.file.filename
  });

  await user.save();
  res.json("Registered");
});

module.exports = router;
