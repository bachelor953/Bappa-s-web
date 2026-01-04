const mongoose = require("mongoose");

module.exports = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  }catch(err){
    console.log("DB error", err);
  }
};
