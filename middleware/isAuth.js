const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let decodedToken;
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Not Authenticated!" });
    }
    const token = authHeader.split(" ")[1];
    decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  req.userId = decodedToken?.userId;
  next();
};
