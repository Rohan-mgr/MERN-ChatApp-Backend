const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRouter = require("./routes/user.routes");
const chatRouter = require("./routes/chat.routes");
const messageRouter = require("./routes/message.routes");
const socketIO = require("./socket");

const app = express();

app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(bodyParser.json());

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    const server = app.listen(process.env.PORT);
    console.log("Database Connection Successfull");

    const io = socketIO.init(server);
    io.on("connection", (socket) => {
      console.log("Client Connected", socket?.id);

      socket.on("disconnect", function () {
        console.log("Client Disconnected!");
      });

      socket.on("create", function (room) {
        console.log(room);
        socket.join(room);
      });

      socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
          if (user._id == newMessageRecieved.sender._id) return;

          socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
      });
    });
  })
  .catch((error) => {
    console.log("Database Connection failed!", error);
  });
