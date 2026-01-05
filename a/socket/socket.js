const { Server } = require("socket.io");

module.exports = function (server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  // userId -> socketId
  const onlineUsers = {};

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // user online register
    socket.on("addUser", (userId) => {
      onlineUsers[userId] = socket.id;
      console.log("Online users:", onlineUsers);
    });

    // private message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const receiverSocket = onlineUsers[receiverId];

      if (receiverSocket) {
        io.to(receiverSocket).emit("getMessage", {
          senderId,
          text
        });
      }
    });

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
