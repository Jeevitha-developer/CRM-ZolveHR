const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateRegister, validateId, validatePagination } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin/Manager only)
router.get('/', authorizeRole('admin', 'manager'), validatePagination, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const is_active = req.query.is_active;
    
    // Base query conditions
    let whereConditions = [];
    let queryParams = [];
    
    // Search filter
    if (search) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Role filter
    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }
    
    // Active filter
    if (is_active !== undefined) {
      whereConditions.push('is_active = ?');
      queryParams.push(is_active === 'true');
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get users with pagination and additional stats
    const dataQuery = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active,
        u.last_login,
        u.created_at,
        COUNT(DISTINCT c.id) as clients_created,
        COUNT(DISTINCT s.id) as subscriptions_created
      FROM users u
      LEFT JOIN clients c ON u.id = c.created_by
      LEFT JOIN subscriptions s ON u.id = s.created_by
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [users] = await connection.execute(dataQuery, [...queryParams, limit, offset]);
    
    res.json({
      users,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        records_per_page: limit,
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1
      }
    });
  } finally {
    connection.release();
  }
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin/Manager can view all, User can only view own profile)
router.get('/:id', validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Check access permissions
    if (req.user.role === 'user' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only view your own profile'
      });
    }

    const [users] = await connection.execute(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active,
        u.last_login,
        u.created_at,
        COUNT(DISTINCT c.id) as clients_created,
        COUNT(DISTINCT s.id) as subscriptions_created,
        COUNT(DISTINCT c2.id) as active_clients
      FROM users u
      LEFT JOIN clients c ON u.id = c.created_by
      LEFT JOIN subscriptions s ON u.id = s.created_by
      LEFT JOIN clients c2 ON u.id = c2.created_by AND c2.status = 'active'
      WHERE u.id = ?
      GROUP BY u.id
    `, [req.params.id]);
    

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    const user = users[0];

    // Get recent activity
    const [recentClients] = await connection.execute(`
      SELECT id, company_name, contact_person, created_at
      FROM clients
      WHERE created_by = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [req.params.id]);

    const [recentSubscriptions] = await connection.execute(`
      SELECT s.id, s.status, s.created_at, c.company_name, p.name as plan_name
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE s.created_by = ?
      ORDER BY s.created_at DESC
      LIMIT 5
    `, [req.params.id]);

    user.recent_clients = recentClients;
    user.recent_subscriptions = recentSubscriptions;

    res.json({ user });
  } finally {
    connection.release();
  }
}));

router.get('/hrms/:id', asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
      const { id } = req.params;
    console.log("req.params", req.params)

  try {
    const { id } = req.params;
    const [rows] = await connection.execute(
      `SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at 
       FROM users 
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });
  } finally {
    connection.release();
  }
}));
// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', authorizeRole('admin'), validateRegister, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password, first_name, last_name, role = 'user' } = req.body;

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

    // Get created user (without password)
    const [newUser] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_active, created_at
      FROM users WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin can update all, Manager can update users, User can update own profile)
router.put('/:id', validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { first_name, last_name, role } = req.body;
    const targetUserId = parseInt(req.params.id);

    // Validate input
    if (!first_name || !last_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'First name and last name are required'
      });
    }

    // Check if user exists
    const [existingUsers] = await connection.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [targetUserId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    const targetUser = existingUsers[0];

    // Permission checks
    if (req.user.role === 'user') {
      // Users can only update their own profile and cannot change role
      if (req.user.id !== targetUserId) {
        return res.status(403).json({
          error: 'Access forbidden',
          message: 'You can only update your own profile'
        });
      }
      
      if (role && role !== targetUser.role) {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'You cannot change your own role'
        });
      }
    } else if (req.user.role === 'manager') {
      // Managers cannot update admin users or change roles to admin
      if (targetUser.role === 'admin' || (role && role === 'admin')) {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'You cannot update admin users or assign admin role'
        });
      }
    }

    // Update user
    const updateRole = role || targetUser.role;
    await connection.execute(`
      UPDATE users SET first_name = ?, last_name = ?, role = ?
      WHERE id = ?
    `, [first_name, last_name, updateRole, targetUserId]);

    // Get updated user
    const [updatedUser] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_active, last_login, created_at
      FROM users WHERE id = ?
    `, [targetUserId]);

    res.json({
      message: 'User updated successfully',
      user: updatedUser[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   PUT /api/users/:id/status
// @desc    Activate/Deactivate user
// @access  Private (Admin only)
router.put('/:id/status', validateId, authorizeRole('admin'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { is_active } = req.body;
    const targetUserId = parseInt(req.params.id);

    // Validate input
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'is_active must be a boolean value'
      });
    }

    // Prevent deactivating own account
    if (req.user.id === targetUserId && !is_active) {
      return res.status(400).json({
        error: 'Cannot deactivate own account',
        message: 'You cannot deactivate your own account'
      });
    }

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    // Update user status
    await connection.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active, targetUserId]
    );

    // If deactivating, invalidate all user sessions
    if (!is_active) {
      await connection.execute(
        'UPDATE user_sessions SET is_active = false WHERE user_id = ?',
        [targetUserId]
      );
    }

    // Get updated user
    const [updatedUser] = await connection.execute(`
      SELECT id, email, first_name, last_name, role, is_active, last_login, created_at
      FROM users WHERE id = ?
    `, [targetUserId]);

    res.json({
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   PUT /api/users/:id/password
// @desc    Reset user password (Admin only)
// @access  Private (Admin only)
router.put('/:id/password', validateId, authorizeRole('admin'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { new_password } = req.body;
    const targetUserId = parseInt(req.params.id);

    // Validate input
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, targetUserId]
    );

    // Invalidate all user sessions to force re-login
    await connection.execute(
      'UPDATE user_sessions SET is_active = false WHERE user_id = ?',
      [targetUserId]
    );

    res.json({
      message: 'Password reset successfully. User will need to login again.'
    });
  } finally {
    connection.release();
  }
}));

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete by deactivating)
// @access  Private (Admin only)
router.delete('/:id', validateId, authorizeRole('admin'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const targetUserId = parseInt(req.params.id);

    // Prevent deleting own account
    if (req.user.id === targetUserId) {
      return res.status(400).json({
        error: 'Cannot delete own account',
        message: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id, first_name, last_name FROM users WHERE id = ?',
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    // Check if user has created clients (data integrity)
    const [clientCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM clients WHERE created_by = ?',
      [targetUserId]
    );

    if (clientCount[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete user',
        message: 'User has created clients. Please reassign or remove client data first.'
      });
    }

    // Soft delete by deactivating the user
    await connection.execute(
      'UPDATE users SET is_active = false WHERE id = ?',
      [targetUserId]
    );

    // Invalidate all user sessions
    await connection.execute(
      'UPDATE user_sessions SET is_active = false WHERE user_id = ?',
      [targetUserId]
    );

    res.json({
      message: 'User deactivated successfully'
    });
  } finally {
    connection.release();
  }
}));

// @route   GET /api/users/stats/overview
// @desc    Get user statistics
// @access  Private (Admin/Manager only)
router.get('/stats/overview', authorizeRole('admin', 'manager'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Get user statistics
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as manager_users,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_last_30_days,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_this_month
      FROM users
    `);

    // Get user activity statistics
    const [activityStats] = await connection.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.last_login,
        COUNT(DISTINCT c.id) as clients_created,
        COUNT(DISTINCT s.id) as subscriptions_created
      FROM users u
      LEFT JOIN clients c ON u.id = c.created_by
      LEFT JOIN subscriptions s ON u.id = s.created_by
      WHERE u.is_active = true
      GROUP BY u.id
      ORDER BY clients_created DESC, subscriptions_created DESC
      LIMIT 10
    `);

    // Get recent login activity
    const [recentLogins] = await connection.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.last_login
      FROM users u
      WHERE u.last_login IS NOT NULL
      ORDER BY u.last_login DESC
      LIMIT 10
    `);

    res.json({
      overview: stats[0],
      top_active_users: activityStats,
      recent_logins: recentLogins
    });
  } finally {
    connection.release();
  }
}));

module.exports = router;