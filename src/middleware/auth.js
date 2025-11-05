// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const auth = (roles = [], requireVerification = true) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          avatar: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }

      // Check if email verification is required for this route
      if (requireVerification && !user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email address to access this resource.'
        });
      }

      // Check role permissions
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired.'
        });
      }
      
      console.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed.'
      });
    }
  };
};

// Export ONLY the main auth function
module.exports = auth;
