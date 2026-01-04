const { Server } = require("socket.io");

module.exports = (server)=>{
  const io = new Server(server,{
    cors:{ origin:"*" }
  });

  io.on("connection", socket=>{
    socket.on("sendMsg", data=>{
      io.emit("getMsg", data);
    });
  });
};
