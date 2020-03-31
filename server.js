const express = require("express");
const app = express();
const socketio = require("socket.io");
const path = require("path");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("./utils/users");
const botName = "SocketChat Bot";

const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//Run when client connects
io.on("connection", socket => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    //join that room
    socket.join(user.room);

    //send message to user who connected
    socket.emit("message", formatMessage(botName, "Welcome to SocketChat!"));

    //Broadcast when a user connects to everyone but the user (only in that room)
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  /*send message to all users
  io.emit("message", "bla bla");*/

  //listen for chat message
  socket.on("chatMessage", msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Runs when client disconnected
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      //send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers
      });
    }
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
