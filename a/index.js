const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// routes
app.use("/auth", require("./routes/auth"));
app.use("/post", require("./routes/post"));
app.use("/chat", require("./routes/chat"));

// socket
require("./socket/socket")(server);

app.get("/", (req,res)=>{
  res.send("Social App Backend Running");
});

server.listen(process.env.PORT || 3000, ()=>{
  console.log("Server running");
});
