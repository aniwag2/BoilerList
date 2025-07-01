// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from header (e.g., 'Bearer TOKEN')
    const token = req.header('x-auth-token'); // Commonly used header for JWTs

    // Check if not token
    if (!token) {
        // 401 Unauthorized
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user from token payload to the request object
        req.user = decoded; // decoded will contain { id: user._id, username: user.username, email: user.email }
        next(); // Proceed to the next middleware/route handler

    } catch (err) {
        // 401 Unauthorized if token is invalid or expired
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;