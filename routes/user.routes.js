const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.get("/", userController.getAllUsers);
router.get("/search", userController.searchUser);

router.post("/signup", userController.createUser);
router.post("/login", userController.userLogin);

module.exports = router;
