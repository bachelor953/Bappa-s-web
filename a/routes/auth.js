const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async(req,res)=>{
  const hash = await bcrypt.hash(req.body.password,10);
  const user = new User({...req.body, password:hash});
  await user.save();
  res.json({msg:"Registered"});
});

router.post("/login", async(req,res)=>{
  const user = await User.findOne({email:req.body.email});
  if(!user) return res.status(400).json({msg:"User not found"});

  const ok = await bcrypt.compare(req.body.password,user.password);
  if(!ok) return res.status(400).json({msg:"Wrong password"});

  const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
  res.json({token,user});
});

module.exports = router;
