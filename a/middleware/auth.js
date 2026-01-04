const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{
  const token = req.headers.token;
  if(!token) return res.status(401).json("No token");

  jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{
    if(err) return res.status(403).json("Invalid token");
    req.user = user;
    next();
  });
};
