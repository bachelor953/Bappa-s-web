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

    // =========================
    // 🔹 USER ONLINE REGISTER
    // =========================
    socket.on("addUser", (userId) => {
      onlineUsers[userId] = socket.id;
      console.log("Online users:", onlineUsers);

      // broadcast updated online list
      io.emit("onlineUsers", Object.keys(onlineUsers));
    });

    // frontend explicitly ask for online users
    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsers", Object.keys(onlineUsers));
    });

    // =========================
    // ✍️ TYPING INDICATOR
    // =========================
    socket.on("typing", ({ senderName, receiverId }) => {
      const receiverSocket = onlineUsers[receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", { senderName });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocket = onlineUsers[receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit("stopTyping");
      }
    });

    // =========================
    // 💬 SEND MESSAGE (FIXED)
    // =========================
    socket.on(
      "sendMessage",
      async ({ senderId, senderName, receiverId, text }) => {
        try {
          const receiverSocket = onlineUsers[receiverId];

          // ✅ CORRECT STATUS LOGIC
          const msg = new Message({
            senderId,
            receiverId,
            text,
            status: receiverSocket ? "delivered" : "sent"
          });

          await msg.save();

          // send live message only if receiver online
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

    // =========================
    // 🔌 DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
        }
      }

      // broadcast updated online list
      io.emit("onlineUsers", Object.keys(onlineUsers));
      console.log("User disconnected");
    });
  });
};
