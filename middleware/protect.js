const { verifyToken } = require("./tokenUtils");

const protect = (req, res, next) => {
    const token = req.cookies.token;
    console.log("Incoming token:", token); 

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded); 

    if (!decoded) {
        return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = decoded;
    next();
};


module.exports = protect;
