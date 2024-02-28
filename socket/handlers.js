const crypto = require("crypto");
const { postMessage } = require("../services/message.services");
const { firebasePostFile, isEmpty } = require("../utils/helper");
const { client } = require("../utils/redis");

class Handlers {
  constructor(io, socket) {
    this._io = io;
    this._socket = socket;
    this._user = null; // user id
    this._userInfo = null; // user info like name email ...
  }

  async disconnect() {
    await client.hdel(process.env.REDIS_KEY, this._user);
    console.log("client socket disconnected");
  }

  // async disconnectHandler() {

  // }

  async userJoin(user, callback = (value) => value) {
    const userId = user?._id;
    // console.log(client);
    // const activeUsers = await client.hget("chat-app:users", "active-user");
    // console.log(JSON.parse(activeUsers), "active users>>>>");
    try {
      if (!userId || (this._user && this._user !== userId)) {
        return callback(true);
      }
      this._user = userId;
      this._userInfo = user;

      console.log(userId, "user socket join");
      await client.hset(process.env.REDIS_KEY, userId, this._userInfo);

      const activeUsers = await client.hgetall(process.env.REDIS_KEY);
      return this._io.emit("active:users", { activeUsers });
    } catch (error) {
      console.log("ERROR IN USER SOCKET JOIN: ", error);
      return callback(false);
    }
  }

  async activeUser() {
    await client.hdel(process.env.REDIS_KEY, this._user);
    const activeUsers = await client.hgetall(process.env.REDIS_KEY);
    return this._io.emit("active:users", { activeUsers });
  }

  async messageSent(payload) {
    console.log(payload, "payload");
    let attachment = {};

    if (payload?.file) {
      attachment.fileUrl = await firebasePostFile(payload);
      attachment.type = payload?.fileType;
      attachment.name = payload?.fileName;
    }

    const newMessage = {
      _id: crypto.randomUUID(),
      sender: this._userInfo,
      content: payload?.message,
      chat: { _id: payload?.chatId },
      attachment: isEmpty(attachment) ? null : attachment,
      updatedAt: new Date(),
    };
    this._io.emit("save-messsage", {
      action: "create",
      message: newMessage,
    });

    return await postMessage(payload?.message, payload?.chatId, this._user, attachment);
  }
}

module.exports = Handlers;
