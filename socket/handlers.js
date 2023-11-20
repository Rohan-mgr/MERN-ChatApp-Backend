const {handledSetTimeout} = require("./utils");

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
        console.log(payload, "messageSent", this._userInfo)
        const newMessage = {
            sender: this._userInfo,
            content: payload?.message,
            chat: {_id: payload?.chatId},
          };
          console.log(newMessage);
        return this._io.to(this._user).emit("save-message", {
            action: "create",
            message: newMessage,
        });
    }
}

module.exports = Handlers;