const jwt = require('jsonwebtoken');

/**
 * Extract user info from JWT token in Authorization header
 * @param {Object} req - Express request object
 * @returns {Object|null} - Decoded user info or null
 */
function extractUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded; // { id: "user123", email: "user@email.com", ... }
  } catch (error) {
    return null;
  }
}

/**
 * Express middleware to verify JWT token and attach user to req.user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireAuth(req, res, next) {
  const user = extractUser(req);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  req.user = user;
  next();
}

/**
 * Express middleware to optionally extract user (doesn't fail if no auth)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function optionalAuth(req, res, next) {
  const user = extractUser(req);
  req.user = user; // Will be null if no auth
  next();
}

module.exports = {
  extractUser,
  requireAuth,
  optionalAuth
};
