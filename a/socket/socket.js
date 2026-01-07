const { Server } = require("socket.io");
const Message = require("../models/Message");

module.exports = function (server) {
  const io = new Server(server,{ cors:{origin:"*"} });
  const onlineUsers = {};

  io.on("connection", socket => {

    socket.on("addUser", userId=>{
      onlineUsers[userId]=socket.id;
      io.emit("onlineUsers",Object.keys(onlineUsers));
    });

    socket.on("getOnlineUsers",()=>{
      socket.emit("onlineUsers",Object.keys(onlineUsers));
    });

    socket.on("typing",({senderName,receiverId})=>{
      const s=onlineUsers[receiverId];
      if(s) io.to(s).emit("typing",{senderName});
    });

    socket.on("stopTyping",({receiverId})=>{
      const s=onlineUsers[receiverId];
      if(s) io.to(s).emit("stopTyping");
    });

    socket.on("callUser",({callerId,callerName,receiverId})=>{
      const s=onlineUsers[receiverId];
      if(s) io.to(s).emit("incomingCall",{callerId,callerName});
    });

    socket.on("acceptCall",({callerId})=>{
      const s=onlineUsers[callerId];
      if(s) io.to(s).emit("callAccepted");
    });

    socket.on("rejectCall",({callerId})=>{
      const s=onlineUsers[callerId];
      if(s) io.to(s).emit("callRejected");
    });

    socket.on("endCall",({otherUserId})=>{
      const s=onlineUsers[otherUserId];
      if(s) io.to(s).emit("callEnded");
    });

    socket.on("webrtc-offer",({to,offer})=>{
      const s=onlineUsers[to];
      if(s) io.to(s).emit("webrtc-offer",offer);
    });

    socket.on("webrtc-answer",({to,answer})=>{
      const s=onlineUsers[to];
      if(s) io.to(s).emit("webrtc-answer",answer);
    });

    socket.on("webrtc-ice",({to,candidate})=>{
      const s=onlineUsers[to];
      if(s) io.to(s).emit("webrtc-ice",candidate);
    });

    socket.on("sendMessage",async d=>{
      const msg=new Message({
        senderId:d.senderId,
        receiverId:d.receiverId,
        text:d.text
      });
      await msg.save();

      const s=onlineUsers[d.receiverId];
      if(s) io.to(s).emit("getMessage",{
        senderName:d.senderName,
        text:d.text
      });
    });

    socket.on("disconnect",()=>{
      for(const u in onlineUsers)
        if(onlineUsers[u]===socket.id) delete onlineUsers[u];
      io.emit("onlineUsers",Object.keys(onlineUsers));
    });
  });
};
