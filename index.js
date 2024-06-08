const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const app = express();
const io = new Server({ cors: true });

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("New Connection");
  socket.on("join-room", (data) => {
    const { roomId, email } = data;
    console.log("User", email, "Joined room", roomId);
    emailToSocketMapping.set(email, socket.id);
    socketToEmailMapping.set(socket.id, email);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { email });
  });

  socket.on("call-user", (data) => {
    const { email, offer } = data;
    const socketId = emailToSocketMapping.get(email);
    const fromEmail = socketToEmailMapping.get(socket.id);
    socket.to(socketId).emit("incomming-call", { from: fromEmail, offer });
  });

  socket.on("call-accepted", (data) => {
    const { email, answer } = data;
    const socketId = emailToSocketMapping.get(email);
    socket.to(socketId).emit("call-accepted", { answer });
  });
});

app.listen(3001, () => console.log("Server is running"));
io.listen(3002);
