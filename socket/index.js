// const { client } = require("../utils/redis");
const Handlers = require("./handlers");
const { withErrorHandler } = require("./utils");

const ALLOWED_ORIGINS = process.env.SOCKET_ALLOWED_ORIGINS.split(", ");

exports.init = function (io) {
  //   client.del(USER_REDIS_KEY);
  //   client.del(SESSION_REDIS_KEY);

  io.use(function (socket, next) {
    try {
      const { token } = socket.handshake.query;
      const { origin } = socket.handshake.headers;
      if (ALLOWED_ORIGINS.length && origin && !ALLOWED_ORIGINS.includes(origin)) {
        throw new Error("Origin not Allowed " + origin);
      }
      if (token !== process.env.SOCKET_TOKEN) {
        throw new Error("Invalid Authorization Token " + token);
      }
      next();
    } catch (error) {
      console.log("ERROR IN SOCKET REQUEST => ", error);
      socket.disconnect();
    }
  });

  io.sockets.on("connection", function (socket) {
    const handlers = new Handlers(io, socket);
    // const handlers = new Handlers(io, socket, USER_REDIS_KEY, SESSION_REDIS_KEY, PAYLOAD_ACCEPT_ACTIONS);
    socket.on("disconnect", withErrorHandler.bind(handlers.disconnect.bind(handlers)));

    socket.on("user:join", withErrorHandler.bind(handlers.userJoin.bind(handlers)));

    socket.on("user:online", withErrorHandler.bind(handlers.activeUser.bind(handlers)));
    socket.on("message:sent", withErrorHandler.bind(handlers.messageSent.bind(handlers)));
  });
};
