const User = require("../models/user");
const Chat = require("../models/chat");
// const { client } = require("../utils/redis");

exports.handleChat = async (req, res) => {
  const { id } = req.params;
  console.log(id, req?.userId, "id");

  if (!id) {
    return res.status(404).json({ message: "User does not Exists" });
  }

  try {
    let isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req?.userId } } },
        { users: { $elemMatch: { $eq: id } } },
        { isGroupChat: false },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
    console.log(isChat, "isChat");
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "fullName email",
    });

    if (isChat.length > 0) {
      throw new Error("Chat already exists");
    } else {
      const chatData = {
        groupName: "one to one chat",
        isGroupChat: false,
        users: [id, req?.userId],
      };

      const createChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createChat?._id }).populate("users", "-password");
      res.status(200).send(fullChat);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.roomName || !req.body.roomId) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = req.body.users;

  if (users.length < 2) {
    return res.status(400).send("More than 2 users are required to form a group chat");
  }

  users.push(req?.userId);

  try {
    const groupChat = await Chat.create({
      groupName: req.body.roomName,
      groupId: req.body.roomId,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

exports.fetchChats = async (req, res) => {
  const { id } = req.params;

  try {
    if (id == 0) {
      return res.status(200).send([]);
    }
    Chat.find({ users: { $elemMatch: { $eq: id || req.userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "fullName email",
        });
        return res.status(200).send(results);
      });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: "Internal Server Error" });
  }
};

exports.fetchSingleChat = async function (chatId) {
  try {
    let chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error("Chat cannot be fetched");
    }
    return chat;
  } catch (error) {
    console.log(error, "Error from fetch single chat");
    throw error;
  }
};
