const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { sendMessages, getMessages } = require("../controllers/message");

router.post("/", isAuth, sendMessages);
router.get("/:chatId", isAuth, getMessages);

module.exports = router;
