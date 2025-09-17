const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Store session in database
const storeSession = async (userId, token, ipAddress, userAgent) => {
  const connection = await pool.getConnection();
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await connection.execute(`
      INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, tokenHash, expiresAt, ipAddress, userAgent]);
  } finally {
    connection.release();
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const connection = await pool.getConnection();
  try {
    // Check if user exists and is active
    const [users] = await connection.execute(
      'SELECT id, email, password, first_name, last_name, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account inactive',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Store session
    await storeSession(
      user.id,
      token,
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent')
    );

    // Update last login
    await connection.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (or Admin only in production)
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name, role = 'user' } = req.body;
  const connection = await pool.getConnection();

  try {
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email address already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await connection.execute(`
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?)
    `, [email, hashedPassword, first_name, last_name, role]);

    // Get created user
    const [newUser] = await connection.execute(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate token
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const tokenHash = crypto.createHash('sha256').update(req.token).digest('hex');
    
    // Invalidate session
    await connection.execute(
      'UPDATE user_sessions SET is_active = false WHERE token_hash = ?',
      [tokenHash]
    );

    res.json({
      message: 'Logout successful'
    });
  } finally {
    connection.release();
  }
}));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, role, last_login, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: users[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { first_name, last_name } = req.body;
  const connection = await pool.getConnection();

  try {
    // Validate input
    if (!first_name || !last_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'First name and last name are required'
      });
    }

    if (first_name.length < 2 || last_name.length < 2) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'First name and last name must be at least 2 characters long'
      });
    }

    // Update profile
    await connection.execute(
      'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
      [first_name, last_name, req.user.id]
    );

    // Get updated user
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', authenticateToken, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const connection = await pool.getConnection();

  try {
    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Current password and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current user password
    const [users] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Invalid current password',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );

    // Invalidate all existing sessions except current one
    const currentTokenHash = crypto.createHash('sha256').update(req.token).digest('hex');
    await connection.execute(
      'UPDATE user_sessions SET is_active = false WHERE user_id = ? AND token_hash != ?',
      [req.user.id, currentTokenHash]
    );

    res.json({
      message: 'Password changed successfully'
    });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // Generate new token
    const newToken = generateToken(req.user.id);

    // Store new session
    await storeSession(
      req.user.id,
      newToken,
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent')
    );

    // Invalidate old token
    const oldTokenHash = crypto.createHash('sha256').update(req.token).digest('hex');
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE user_sessions SET is_active = false WHERE token_hash = ?',
        [oldTokenHash]
      );
    } finally {
      connection.release();
    }

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    throw error;
  }
}));

module.exports = router;