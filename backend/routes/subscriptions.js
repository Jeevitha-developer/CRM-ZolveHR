const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole, authorizeClient } = require('../middleware/auth');
const { validateSubscription, validateId, validatePagination, validateDateRange } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/subscriptions
// @desc    Get all subscriptions with pagination and filtering
// @access  Private
router.get('/', validatePagination, validateDateRange, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const payment_status = req.query.payment_status || '';
    const plan_id = req.query.plan_id || '';
    const client_id = req.query.client_id || '';
    const start_date = req.query.start_date || '';
    const end_date = req.query.end_date || '';
    
    // Base query conditions
    let whereConditions = [];
    let queryParams = [];
    
    // Role-based access control
    if (req.user.role === 'user') {
      whereConditions.push('c.created_by = ?');
      queryParams.push(req.user.id);
    }
    
    // Filters
    if (status) {
      whereConditions.push('s.status = ?');
      queryParams.push(status);
    }
    
    if (payment_status) {
      whereConditions.push('s.payment_status = ?');
      queryParams.push(payment_status);
    }
    
    if (plan_id) {
      whereConditions.push('s.plan_id = ?');
      queryParams.push(plan_id);
    }
    
    if (client_id) {
      whereConditions.push('s.client_id = ?');
      queryParams.push(client_id);
    }
    
    if (start_date) {
      whereConditions.push('s.start_date >= ?');
      queryParams.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push('s.end_date <= ?');
      queryParams.push(end_date);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      ${whereClause}
    `;
    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get subscriptions with pagination
// Get subscriptions with pagination
const dataQuery = `
  SELECT 
    s.*,
    p.name as plan_name,
    p.features,
    p.module_access,
    u.first_name as created_by_name,
    u.last_name as created_by_lastname
  FROM subscriptions s
  JOIN clients c ON s.client_id = c.id
  JOIN plans p ON s.plan_id = p.id
  LEFT JOIN users u ON s.created_by = u.id
  ${whereClause}
  ORDER BY s.created_at DESC
  LIMIT ${connection.escape(limit)} OFFSET ${connection.escape(offset)}
`;

const [subscriptions] = await connection.execute(dataQuery, queryParams);

    
    res.json({
      subscriptions,
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

// @route   GET /api/subscriptions/:id
// @desc    Get subscription by ID
// @access  Private
router.get('/:id', validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [subscriptions] = await connection.execute(`
      SELECT 
        s.*,
        c.company_name,
        c.contact_person,
        c.email as client_email,
        c.phone as client_phone,
        p.name as plan_name,
        p.description as plan_description,
        p.features,
        p.module_access,
        p.max_users,
        p.max_clients,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (subscriptions.length === 0) {
      return res.status(404).json({
        error: 'Subscription not found',
        message: 'The specified subscription does not exist'
      });
    }

    const subscription = subscriptions[0];

    // Role-based access control
    if (req.user.role === 'user') {
      const [clientAccess] = await connection.execute(
        'SELECT created_by FROM clients WHERE id = ?',
        [subscription.client_id]
      );
      
      if (clientAccess.length === 0 || clientAccess[0].created_by !== req.user.id) {
        return res.status(403).json({
          error: 'Access forbidden',
          message: 'You do not have permission to access this subscription'
        });
      }
    }

    // Get HRMS integration logs
    const [hrmsLogs] = await connection.execute(`
      SELECT *
      FROM hrms_integration_log
      WHERE subscription_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [req.params.id]);

    subscription.hrms_logs = hrmsLogs;

    res.json({ subscription });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', validateSubscription, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      client_id,
      plan_id,
      start_date,
      end_date,
      amount_inr,
      billing_cycle,
      payment_status = 'pending',
      status = 'active',
      auto_renewal = true,
      payment_method,
    } = req.body;

    // Verify client exists and user has access
    const [clients] = await connection.execute(
      'SELECT id, created_by FROM clients WHERE id = ?',
      [client_id]
    );

    if (clients.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Client not found',
        message: 'The specified client does not exist'
      });
    }

    // Role-based access control
    if (req.user.role === 'user' && clients[0].created_by !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have permission to create subscriptions for this client'
      });
    }

    // Verify plan exists
    const [plans] = await connection.execute(
      'SELECT id, name, is_active FROM plans WHERE id = ?',
      [plan_id]
    );

    if (plans.length === 0 || !plans[0].is_active) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Plan not found',
        message: 'The specified plan does not exist or is inactive'
      });
    }

    // Check for overlapping active subscriptions
    const [overlapping] = await connection.execute(`
      SELECT id FROM subscriptions 
      WHERE client_id = ? 
      AND status IN ('active', 'suspended')
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `, [client_id, start_date, start_date, end_date, end_date, start_date, end_date]);

    if (overlapping.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        error: 'Overlapping subscription',
        message: 'Client already has an active subscription for the specified period'
      });
    }

    // Calculate next payment date
    let next_payment_date = null;
    if (payment_status === 'paid' && auto_renewal) {
      const startDateObj = new Date(start_date);
      if (billing_cycle === 'monthly') {
        next_payment_date = new Date(startDateObj.setMonth(startDateObj.getMonth() + 1));
      } else {
        next_payment_date = new Date(startDateObj.setFullYear(startDateObj.getFullYear() + 1));
      }
    }

    // Create subscription
    const [result] = await connection.execute(`
      INSERT INTO subscriptions (
        client_id, plan_id, status, payment_status, start_date, end_date, amount_inr,
        billing_cycle, auto_renewal, last_payment_date, next_payment_date,
        payment_method, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      client_id, plan_id, status, payment_status, start_date, end_date, amount_inr,
      billing_cycle, auto_renewal, 
      payment_status === 'paid' ? new Date() : null,
      next_payment_date,
      payment_method, req.user.id
    ]);

    await connection.commit();

    // Get created subscription with details
    const [newSubscription] = await connection.execute(`
      SELECT 
        s.*,
        c.company_name,
        c.contact_person,
        p.name as plan_name,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: newSubscription[0]
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription
// @access  Private
router.put('/:id', validateId, validateSubscription, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Check if subscription exists and get current data
    const [currentSubs] = await connection.execute(`
      SELECT s.*, c.created_by as client_created_by
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (currentSubs.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Subscription not found',
        message: 'The specified subscription does not exist'
      });
    }

    const currentSub = currentSubs[0];

    // Role-based access control
    if (req.user.role === 'user' && currentSub.client_created_by !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have permission to update this subscription'
      });
    }

    const {
      plan_id,
      start_date,
      end_date,
      amount_inr,
      billing_cycle,
      payment_status,
      status,
      auto_renewal,
      payment_method,
      transaction_id,
      notes
    } = req.body;

    // Verify plan exists if being changed
    if (plan_id && plan_id !== currentSub.plan_id) {
      const [plans] = await connection.execute(
        'SELECT id, is_active FROM plans WHERE id = ?',
        [plan_id]
      );

      if (plans.length === 0 || !plans[0].is_active) {
        await connection.rollback();
        return res.status(404).json({
          error: 'Plan not found',
          message: 'The specified plan does not exist or is inactive'
        });
      }
    }

    // Check for overlapping subscriptions if dates are being changed
    if (start_date !== currentSub.start_date || end_date !== currentSub.end_date) {
      const [overlapping] = await connection.execute(`
        SELECT id FROM subscriptions 
        WHERE client_id = ? 
        AND id != ?
        AND status IN ('active', 'suspended')
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
      `, [currentSub.client_id, req.params.id, start_date, start_date, end_date, end_date, start_date, end_date]);

      if (overlapping.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          error: 'Overlapping subscription',
          message: 'Client already has an active subscription for the specified period'
        });
      }
    }

    // Calculate payment dates
    let last_payment_date = currentSub.last_payment_date;
    let next_payment_date = currentSub.next_payment_date;

    if (payment_status === 'paid' && currentSub.payment_status !== 'paid') {
      last_payment_date = new Date();
      if (auto_renewal) {
        const startDateObj = new Date(start_date);
        if (billing_cycle === 'monthly') {
          next_payment_date = new Date(startDateObj.setMonth(startDateObj.getMonth() + 1));
        } else {
          next_payment_date = new Date(startDateObj.setFullYear(startDateObj.getFullYear() + 1));
        }
      }
    }

    // Update subscription
    await connection.execute(`
      UPDATE subscriptions SET
        plan_id = ?, start_date = ?, end_date = ?, amount_inr = ?, billing_cycle = ?,
        payment_status = ?, status = ?, auto_renewal = ?, last_payment_date = ?,
        next_payment_date = ?, payment_method = ?, transaction_id = ?, notes = ?
      WHERE id = ?
    `, [
      plan_id || currentSub.plan_id,
      start_date,
      end_date,
      amount_inr,
      billing_cycle,
      payment_status,
      status,
      auto_renewal,
      last_payment_date,
      next_payment_date,
      payment_method,
      transaction_id,
      notes,
      req.params.id
    ]);

    await connection.commit();

    // Get updated subscription
    const [updatedSubscription] = await connection.execute(`
      SELECT 
        s.*,
        c.company_name,
        c.contact_person,
        p.name as plan_name,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    res.json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription[0]
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// @route   DELETE /api/subscriptions/:id
// @desc    Cancel subscription
// @access  Private
router.delete('/:id', validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Check if subscription exists
    const [subscriptions] = await connection.execute(`
      SELECT s.*, c.created_by as client_created_by
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (subscriptions.length === 0) {
      return res.status(404).json({
        error: 'Subscription not found',
        message: 'The specified subscription does not exist'
      });
    }

    const subscription = subscriptions[0];

    // Role-based access control
    if (req.user.role === 'user' && subscription.client_created_by !== req.user.id) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have permission to cancel this subscription'
      });
    }

    // Update subscription status to cancelled instead of deleting
    await connection.execute(
      'UPDATE subscriptions SET status = ?, auto_renewal = false WHERE id = ?',
      ['cancelled', req.params.id]
    );

    res.json({
      message: 'Subscription cancelled successfully'
    });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/subscriptions/:id/renew
// @desc    Renew subscription
// @access  Private
router.post('/:id/renew', validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get subscription details
    const [subscriptions] = await connection.execute(`
      SELECT s.*, c.created_by as client_created_by, p.price_inr
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (subscriptions.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Subscription not found',
        message: 'The specified subscription does not exist'
      });
    }

    const subscription = subscriptions[0];

    // Role-based access control
    if (req.user.role === 'user' && subscription.client_created_by !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have permission to renew this subscription'
      });
    }

    // Calculate new dates
    const currentEndDate = new Date(subscription.end_date);
    const newStartDate = new Date(currentEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    
    const newEndDate = new Date(newStartDate);
    if (subscription.billing_cycle === 'monthly') {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    // Create new subscription record
    const [result] = await connection.execute(`
      INSERT INTO subscriptions (
        client_id, plan_id, status, payment_status, start_date, end_date, amount_inr,
        billing_cycle, auto_renewal, payment_method, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      subscription.client_id,
      subscription.plan_id,
      'active',
      'pending',
      newStartDate,
      newEndDate,
      subscription.price_inr,
      subscription.billing_cycle,
      subscription.auto_renewal,
      subscription.payment_method,
      'Renewed subscription',
      req.user.id
    ]);

    await connection.commit();

    // Get new subscription details
    const [newSubscription] = await connection.execute(`
      SELECT 
        s.*,
        c.company_name,
        c.contact_person,
        p.name as plan_name
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Subscription renewed successfully',
      subscription: newSubscription[0]
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// @route   GET /api/subscriptions/stats/overview
// @desc    Get subscription statistics
// @access  Private
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    let whereCondition = '';
    let queryParams = [];
    
    // Role-based access control
    if (req.user.role === 'user') {
      whereCondition = 'WHERE c.created_by = ?';
      queryParams.push(req.user.id);
    }

    // Get subscription statistics
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN s.status = 'expired' THEN 1 END) as expired_subscriptions,
        COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
        COUNT(CASE WHEN s.payment_status = 'paid' THEN 1 END) as paid_subscriptions,
        COUNT(CASE WHEN s.payment_status = 'overdue' THEN 1 END) as overdue_subscriptions,
        SUM(CASE WHEN s.status = 'active' THEN s.amount_inr ELSE 0 END) as total_monthly_revenue,
        AVG(s.amount_inr) as average_subscription_value
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      ${whereCondition}
    `, queryParams);

    // Get plan distribution
    const [planStats] = await connection.execute(`
      SELECT 
        p.name,
        COUNT(s.id) as subscription_count,
        SUM(s.amount_inr) as total_revenue
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
      ${whereCondition}
      GROUP BY p.id, p.name
      ORDER BY subscription_count DESC
    `, queryParams);

    // Get monthly revenue trend (last 12 months)
    const [revenueStats] = await connection.execute(`
      SELECT 
        DATE_FORMAT(s.start_date, '%Y-%m') as month,
        SUM(s.amount_inr) as revenue,
        COUNT(s.id) as subscription_count
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      ${whereCondition}
      ${whereCondition ? 'AND' : 'WHERE'} s.start_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(s.start_date, '%Y-%m')
      ORDER BY month DESC
    `, queryParams);

    res.json({
      overview: stats[0],
      plan_distribution: planStats,
      revenue_trend: revenueStats
    });
  } finally {
    connection.release();
  }
}));

module.exports = router;