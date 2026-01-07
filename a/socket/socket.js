const { Server } = require("socket.io");
const Message = require("../models/Message");

module.exports = function(server){
  const io = new Server(server,{ cors:{origin:"*"} });
  const onlineUsers = {};

  io.on("connection",socket=>{

    socket.on("addUser",id=>{
      onlineUsers[id]=socket.id;
      io.emit("onlineUsers",Object.keys(onlineUsers));
    });

    socket.on("getOnlineUsers",()=>{
      socket.emit("onlineUsers",Object.keys(onlineUsers));
    });

    socket.on("typing",d=>{
      const s=onlineUsers[d.receiverId];
      if(s) io.to(s).emit("typing",{senderName:d.senderName});
    });

    socket.on("stopTyping",d=>{
      const s=onlineUsers[d.receiverId];
      if(s) io.to(s).emit("stopTyping");
    });

    socket.on("sendMessage",async d=>{
      const s=onlineUsers[d.receiverId];
      await new Message({
        senderId:d.senderId,
        receiverId:d.receiverId,
        text:d.text,
        status:s?"delivered":"sent"
      }).save();

      if(s){
        io.to(s).emit("getMessage",{
          senderName:d.senderName,
          text:d.text
        });
      }
    });

    socket.on("callUser",d=>{
      const s=onlineUsers[d.receiverId];
      if(s) io.to(s).emit("incomingCall",d);
    });

    socket.on("acceptCall",d=>{
      const s=onlineUsers[d.callerId];
      if(s) io.to(s).emit("callAccepted");
    });

    socket.on("rejectCall",d=>{
      const s=onlineUsers[d.callerId];
      if(s) io.to(s).emit("callRejected");
    });

    socket.on("endCall",d=>{
      const s=onlineUsers[d.otherUserId];
      if(s) io.to(s).emit("callEnded");
    });

    socket.on("webrtc-offer",d=>{
      const s=onlineUsers[d.to];
      if(s) io.to(s).emit("webrtc-offer",d.offer);
    });

    socket.on("webrtc-answer",d=>{
      const s=onlineUsers[d.to];
      if(s) io.to(s).emit("webrtc-answer",d.answer);
    });

    socket.on("webrtc-ice",d=>{
      const s=onlineUsers[d.to];
      if(s) io.to(s).emit("webrtc-ice",d.candidate);
    });

    socket.on("disconnect",()=>{
      for(let k in onlineUsers)
        if(onlineUsers[k]===socket.id) delete onlineUsers[k];
      io.emit("onlineUsers",Object.keys(onlineUsers));
    });
  });
};
