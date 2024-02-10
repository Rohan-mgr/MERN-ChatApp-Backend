const {handledSetTimeout} = require("./utils");
const crypto = require("crypto");
const {postMessage} = require("../services/message.services");
const {firebasePostFile, isEmpty} = require("../utils/helper");


class Handlers {
    constructor(io, socket) {
        this._io = io; 
        this._socket = socket;
        this._user = null; // user id
        this._userInfo = null; // user info like name email ...
    }

    async disconnect() {
        handledSetTimeout(() => {
            this.disconnectHandler()
        }, 10 * 1000);
    }

    async disconnectHandler() {
        console.log("client socket disconnected");
    }

    async userJoin(user, callback = (value) => value) {
        const userId = user?._id;
        try {
            if(!userId || (this._user && this._user !== userId)) {
                return callback(true); 
            }
            this._user = userId;
            this._userInfo = user;
            console.log(userId, "user socket join")
        } catch(error) {
            console.log("ERROR IN USER SOCKET JOIN: ", error);
            return callback(false); 
        }
    }

    async messageSent(payload) {
        console.log(payload, "payload");
        let attachment={}; 

        if(payload?.file) {
            attachment.fileUrl = await firebasePostFile(payload);
            attachment.type = payload?.fileType;
            attachment.name = payload?.fileName;
        }

        const newMessage = {
            _id: crypto.randomUUID(),
            sender: this._userInfo,
            content: payload?.message,
            chat: {_id: payload?.chatId},
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