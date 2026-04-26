// C:\...\backend\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: "No token, authorization denied" });
  }

  // 2. Extract the actual token string
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user to request
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Token is not valid" });
  }
};