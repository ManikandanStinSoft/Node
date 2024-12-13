const jwt = require("jsonwebtoken");

const generateToken = (admin) => {
    const payload = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
};
