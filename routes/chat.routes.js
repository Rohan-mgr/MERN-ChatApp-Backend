const express = require("express");
const isAuth = require("../middleware/isAuth");
const chatController = require("../controllers/chat");
const router = express.Router();

router.post("/group-chat", isAuth, chatController.createGroupChat);
router.get("/all/:id", chatController.fetchChats);
router.post("/:id", isAuth, chatController.handleChat);

module.exports = router;
