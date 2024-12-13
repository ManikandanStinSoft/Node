const jwt = require("jsonwebtoken");
const getAdminById = require("../controllers/adminController");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  console.log("Received token:", token);
  console.log("Authorization header:", req.headers.authorization);
  console.log("Cookie token:", req.cookies.token);

  if (!token) {
    console.error("No token provided.");
    return res
      .status(401)
      .json({ message: "Not Authorized to access this route." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.decoded = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res
      .status(401)
      .json({ message: "Not Authorized to access this route." });
  }
};
