const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth_token; 

    console.log("Received Token:", token); 

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token Error:", err); 
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
