const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const {getMessages } = require("../controllers/message");

// router.post("/", isAuth, sendMessages);
router.get("/:chatId", isAuth, getMessages);
// router.get("/allMessages", isAuth, getAllMessages);

module.exports = router;
