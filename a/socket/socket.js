const { Server } = require("socket.io");
const Message = require("../models/Message");

module.exports = function (server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  // userId -> socketId
  const onlineUsers = {};

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // 🔹 register user as online
    socket.on("addUser", (userId) => {
      onlineUsers[userId] = socket.id;
      console.log("Online users:", onlineUsers);
    });

    // 🔹 private message + SAVE TO DB + senderName support
    socket.on(
      "sendMessage",
      async ({ senderId, senderName, receiverId, text }) => {
        try {
          // 1️⃣ save message to MongoDB
          const msg = new Message({
            senderId,
            receiverId,
            text
          });
          await msg.save();

          // 2️⃣ send live message to receiver if online
          const receiverSocket = onlineUsers[receiverId];
          if (receiverSocket) {
            io.to(receiverSocket).emit("getMessage", {
              senderId,
              senderName,
              text
            });
          }
        } catch (err) {
          console.log("Message send error:", err.message);
        }
      }
    );

    // 🔹 handle disconnect
    socket.on("disconnect", () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
        }
      }
      console.log("User disconnected");
    });
  });
};
