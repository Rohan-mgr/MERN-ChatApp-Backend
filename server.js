const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRouter = require("./routes/user.routes");
const chatRouter = require("./routes/chat.routes");
const messageRouter = require("./routes/message.routes");
var debug = require("debug")("MERN-Chat-App:server");
const firebaseConfig = require("./config/firebaseConfig");
const { initializeApp } = require("firebase/app");
const multer = require("multer");
const cors = require("cors");

// const socketIO = require("./socket");

const app = express();
var server = require("http").Server(app);

const port = process.env.PORT;

//initialize firebase
initializeApp(firebaseConfig);

//socket
var io = require("socket.io")(server);

// const storage = multer.memoryStorage();

app.use(helmet());
app.use(express.urlencoded({ extended: false }));

var corsOptions = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const { init } = require("./socket");
init(io);

app.use(function (req, res, next) {
  res.io = io;
  next();
});

console.log("Environment: ", process.env.NODE_ENV);

app.use(multer().single("profile"));

app.use(function (req, res, next) {
  if (process.env.NODE_ENV !== "production") res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin");
  if (req.method === "OPTIONS") {
    return res.writeHead(200).end();
  }
  next();
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

app.get("*", (req, res, next) => {
  res.status(200).json({
    message: "bad request",
  });
});

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
  })
  .catch((error) => {
    console.log("Database Connection failed!", error);
  });
