const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Verify JWT token and authenticate user
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is blacklisted or expired in database
    const connection = await pool.getConnection();
    try {
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      const [sessionRows] = await connection.execute(
        'SELECT id, is_active, expires_at FROM user_sessions WHERE token_hash = ?',
        [tokenHash]
      );

      if (sessionRows.length === 0 || !sessionRows[0].is_active || new Date() > sessionRows[0].expires_at) {
        return res.status(401).json({
          error: 'Token invalid or expired',
          message: 'Please login again'
        });
      }

      // Get user information
      const [userRows] = await connection.execute(
        'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (userRows.length === 0 || !userRows[0].is_active) {
        return res.status(401).json({
          error: 'User not found or inactive',
          message: 'User account is not active'
        });
      }

      // Add user information to request
      req.user = userRows[0];
      req.token = token;
      
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please provide a valid authentication token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// Check if user has required role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login first'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Check if user can access specific client data
const authorizeClient = async (req, res, next) => {
  try {
    const clientId = req.params.clientId || req.params.id || req.body.client_id;
    
    if (!clientId) {
      return res.status(400).json({
        error: 'Client ID required',
        message: 'Client ID must be provided'
      });
    }

    // Admin can access all clients
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has access to this client
    const connection = await pool.getConnection();
    try {
      const [clientRows] = await connection.execute(
        'SELECT id, created_by FROM clients WHERE id = ?',
        [clientId]
      );

      if (clientRows.length === 0) {
        return res.status(404).json({
          error: 'Client not found',
          message: 'The specified client does not exist'
        });
      }

      // Manager can access all clients, user can only access their own clients
      if (req.user.role === 'manager' || clientRows[0].created_by === req.user.id) {
        return next();
      }

      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have permission to access this client'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Client authorization error:', error);
    return res.status(500).json({
      error: 'Authorization failed',
      message: 'Internal server error during authorization'
    });
  }
};

// Validate API key for HRMS integration
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide a valid API key'
    });
  }

  // In production, you should store API keys in database and validate them
  const validApiKeys = [
    process.env.HRMS_API_KEY,
    'hrms-integration-key-2024'
  ];

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeClient,
  validateApiKey
};