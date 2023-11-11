let io;

module.exports = {
  init: (httpserver) => {
    io = require("socket.io")(httpserver, {
      cors: {
        origin: process.env.CLIENT_URL,
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io is not initialized");
    }
    return io;
  },
};
