const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static("docs")); // frontend ONLY

// DB
connectDB();

// API ROUTES
app.use("/auth", require("./routes/auth"));
app.use("/post", require("./routes/post"));
app.use("/chat", require("./routes/chat"));
app.use("/users", require("./routes/users"));

// BACKEND STATUS (NOT /)
app.get("/status", (req, res) => {
  res.send("Social App Backend Running");
});

// SOCKET
require("./socket/socket")(server);

// START
server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
