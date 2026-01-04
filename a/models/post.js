const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userId:String,
  text:String,
  likes:[String],
  comments:[
    { userId:String, text:String }
  ],
  createdAt:{ type:Date, default:Date.now }
});

module.exports = mongoose.model("Post", PostSchema);
