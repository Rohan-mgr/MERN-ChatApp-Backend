const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { firebasePostFile } = require("../utils/helper");

exports.createUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  const file = req.file;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({ message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const profile = (await firebasePostFile(file, true)) || null;

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      profileUrl: profile,
    });

    await newUser.save();
    res.status(200).json({
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, user?.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Password do not match" });
    }

    const token = jwt.sign(
      {
        fullName: user?.fullName,
        email: user?.email,
        userId: user?._id?.toString(),
      },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({ message: "Login Successfull", loggedInUser: user, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllUsers = async (req, res) => {
  // function for getting all users
  try {
    const users = await User.find().select("-password");
    if (!users) {
      return res.status(404).json({ message: "No Users Found" });
    }
    res.status(200).json({ message: "All Users Fetched Successfully", users: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.searchUser = async (req, res) => {
  const query = req.query.q;

  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ message: "No Users Found" });
    }

    const searchResults = users.filter((user) => {
      return user.fullName.toLowerCase().includes(query.toLowerCase());
    });
    if (!searchResults) {
      return res.status(404).json({ message: "No Users Found" });
    }
    res.status(200).json({
      message: "All Users Fetched Successfully",
      users: searchResults,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { userId } = req.body;
  const file = req.file;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "No User Found" });
    }
    console.log(user);
    const profile = await firebasePostFile(file, true);

    user.profileUrl = profile;
    await user.save();

    res.status(200).json({ message: "image uploaded successfully", updatedUser: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
