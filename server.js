const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRouter = require("./routes/user.routes");
const chatRouter = require("./routes/chat.routes");
const messageRouter = require("./routes/message.routes");
var debug = require('debug')('MERN-Chat-App:server');
const firebaseConfig = require("./config/firebaseConfig"); 
const {initializeApp} = require("firebase/app");

// const socketIO = require("./socket");

const app = express();
var server = require("http").Server(app);

const port = process.env.PORT;

//initialize firebase 
initializeApp(firebaseConfig);


//socket
var io = require("socket.io")(server)

app.use(helmet());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

const { init } = require("./socket");
init(io);

app.use(function (req, res, next) {
  res.io = io;
  next();
});

console.log("Environment: ", process.env.NODE_ENV);

app.use(function (req, res, next) {
  if (process.env.NODE_ENV !== 'production') res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin");
  if (req.method === 'OPTIONS') {
    return res.writeHead(200).end();
  }
  next();
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {

    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);

    function onError(error) {
      // Check if the error is not related to the 'listen' syscall
      if (error.syscall !== "listen") {
        throw error;
      }
    
      // Determine the binding information based on the type of port
      var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    
      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case "EACCES":
          console.error(bind + " requires elevated privileges");
          process.exit(1); // Exit the process with an error code
          break;
        case "EADDRINUSE":
          console.error(bind + " is already in use");
          process.exit(1); // Exit the process with an error code
          break;
        default:
          throw error; // Propagate other errors
      }
    }

    function onListening() {
      // Get the address information of the server
      var addr = server.address();
    
      // Determine the binding information based on the type of address
      var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    
      // Log a message indicating that the server is listening
      debug("Listening on " + bind);
    }

    // const server = app.listen(process.env.PORT);
    // console.log("Database Connection Successfull");

    // const io = socketIO.init(server);
    // io.on("connection", (socket) => {
    //   console.log("Client Connected", socket?.id);

    //   socket.on("disconnect", function () {
    //     console.log("Client Disconnected!");
    //   });

    //   socket.on("create", function (room) {
    //     console.log(room);
    //     socket.join(room);
    //   });

    //   socket.on("new message", (newMessageRecieved) => {
    //     var chat = newMessageRecieved.chat;
    //     if (!chat.users) return console.log("chat.users not defined");

    //     chat.users.forEach((user) => {
    //       if (user._id == newMessageRecieved.sender._id) return;

    //       socket.in(user._id).emit("message recieved", newMessageRecieved);
    //     });
    //   });
    // });
  })
  .catch((error) => {
    console.log("Database Connection failed!", error);
  });
