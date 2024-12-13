const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const adminController = require("../controllers/adminController");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  if (adminController.tokenBlacklist.has(token)) {
    return res
      .status(401)
      .json({ message: "Token is invalid, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token, authorization denied" });
  }
};

module.exports = protect;
