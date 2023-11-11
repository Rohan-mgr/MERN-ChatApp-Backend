const express = require("express");
const isAuth = require("../middleware/isAuth");
const chatController = require("../controllers/chat");
const router = express.Router();

router.get("/", isAuth, chatController.fetchChats);
router.post("/group-chat", isAuth, chatController.createGroupChat);
router.post("/:id", isAuth, chatController.handleChat);

module.exports = router;
