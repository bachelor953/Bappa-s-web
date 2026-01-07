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
    // 📞 CALL SIGNALING
    // =========================

    // call request
    socket.on("callUser", ({ callerId, callerName, receiverId }) => {
      const receiverSocket = onlineUsers[receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit("incomingCall", {
          callerId,
          callerName
        });
      }
    });

    // call accepted
    socket.on("acceptCall", ({ callerId, receiverId }) => {
      const callerSocket = onlineUsers[callerId];
      if (callerSocket) {
        io.to(callerSocket).emit("callAccepted");
      }
    });

    // call rejected
    socket.on("rejectCall", ({ callerId }) => {
      const callerSocket = onlineUsers[callerId];
      if (callerSocket) {
        io.to(callerSocket).emit("callRejected");
      }
    });

    // call ended
    socket.on("endCall", ({ otherUserId }) => {
      const otherSocket = onlineUsers[otherUserId];
      if (otherSocket) {
        io.to(otherSocket).emit("callEnded");
      }
    });

    // =========================
    // 🔁 WEBRTC SIGNALING
    // =========================
    socket.on("webrtc-offer", ({ to, offer }) => {
      const s = onlineUsers[to];
      if (s) io.to(s).emit("webrtc-offer", offer);
    });

    socket.on("webrtc-answer", ({ to, answer }) => {
      const s = onlineUsers[to];
      if (s) io.to(s).emit("webrtc-answer", answer);
     });

    socket.on("webrtc-ice", ({ to, candidate }) => {
      const s = onlineUsers[to];
      if (s) io.to(s).emit("webrtc-ice", candidate);
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
