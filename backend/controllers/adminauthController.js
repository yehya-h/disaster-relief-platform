const jwt = require("jsonwebtoken");
require('dotenv').config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Login controller
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token with role=2
    const token = jwt.sign(
        { username, role: 2 },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    // Send token along with user info
    res.json({
        token,
        user: {
            username,
            role: 2
        }
    });
};

// Logout controller (optional, for stateless JWT just respond OK)
const adminLogout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

// Verify token controller
const verifyAdminToken = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 2) {
            return res.status(403).json({ message: 'Forbidden: Invalid role' });
        }

        // Send user info along with validation
        res.json({
            valid: true,
            user: {
                username: decoded.username,
                role: decoded.role
            }
        });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = {
    adminLogin,
    adminLogout,
    verifyAdminToken
};