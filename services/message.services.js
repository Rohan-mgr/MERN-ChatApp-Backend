const Message = require("../models/Message");
const User = require("../models/user");
const Chat = require("../models/chat");

async function postMessage(message, chatId, userId, attachment) {
    if (!message || !chatId) {
        // return res.status(400).send({ message: "Cannot send the message" });
        throw new Error("Cannot save message");
      }
    
      const newMessage = {
        sender: userId,
        content: message,
        chat: chatId,
        attachment
      };
      try {
        let saveMessage = await Message.create(newMessage);
        saveMessage = await saveMessage.populate("sender");
        saveMessage = await saveMessage.populate("chat");
        saveMessage = await User.populate(saveMessage, {
          path: "chat.users",
        });
    
        await Chat.findByIdAndUpdate(chatId, {
          latestMessage: saveMessage,
        });

        // console.log(saveMessage, "message saved successfully");
        // io.getIO().emit("save-messsage", {
        //   action: "create",
        //   message: saveMessage,
        // });
        // res.status(200).json(saveMessage);
      } catch (error) {
        console.log(error);
        // res.status(500).send({ message: "Internal Server Error" });
        throw new Error(error.message || "Internal Server Error");
      }
}

exports.postMessage = postMessage;