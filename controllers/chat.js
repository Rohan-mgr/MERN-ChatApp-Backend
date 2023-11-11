const User = require("../models/user");
const Chat = require("../models/chat");
// const { client } = require("../utils/redis");

exports.handleChat = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(404).json({ message: "User does not Exists" });
  }

  try {
    let isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: id } } },
        { users: { $elemMatch: { $eq: req?.userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

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
      const fullChat = await Chat.findOne({ _id: createChat?._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createGroupChat = async (req, res) => {
  // console.log(req?.user);
  // res.end();
  if (!req.body.users || !req.body.roomName) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = req.body.users;

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req?.userId);

  try {
    const groupChat = await Chat.create({
      groupName: req.body.roomName,
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
  try {
    // const latestChatUser = await Chat.find()
    //   .sort({ updatedAt: -1 })
    //   .populate("users", "-password");
    // const reply = await client.get(req?.userId);
    // const exist = JSON.parse(reply)?.some(
    //   (item) =>
    //     item.users[0]?._id.toString() ===
    //     latestChatUser[0]?.users[0]?._id.toString()
    // );
    // if (exist) {
    //   console.log("form cached");
    //   res.status(200).send(JSON.parse(reply));
    //   return;
    // }

    // console.log(req?.userId);
    // const chats = await Chat.find({
    //   users: { $elemMatch: { $eq: req?.userId } },
    // })
    //   .populate("users", "-password")
    //   .populate("groupAdmin", "-password")
    //   .populate("latestMessage")
    //   .sort({ updatedAt: -1 });

    // const result = await User.populate(chats, {
    //   path: "lastesMessage.sender",
    // });
    // await client.set(req?.userId, JSON.stringify(result));
    // res.status(200).send(result);

    Chat.find({ users: { $elemMatch: { $eq: req.userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "fullName email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: "Internal Server Error" });
  }
};
