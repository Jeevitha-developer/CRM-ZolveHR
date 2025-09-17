const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validatePlan, validateId, validatePagination } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/plans
// @desc    Get all plans with pagination and filtering
// @access  Private
router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const is_active = req.query.is_active;
    const billing_cycle = req.query.billing_cycle || '';
    const search = req.query.search || '';
    
    // Base query conditions
    let whereConditions = [];
    let queryParams = [];
    
    // Active filter
    if (is_active !== undefined) {
      whereConditions.push('is_active = ?');
      queryParams.push(is_active === 'true');
    }
    
    // Billing cycle filter
    if (billing_cycle) {
      whereConditions.push('billing_cycle = ?');
      queryParams.push(billing_cycle);
    }
    
    // Search filter
    if (search) {
      whereConditions.push('(name LIKE ? OR description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM plans 
      ${whereClause}
    `;
    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get plans with pagination
    const dataQuery = `
      SELECT 
        p.*,
        COUNT(DISTINCT s.id) as active_subscriptions,
        SUM(CASE WHEN s.status = 'active' THEN s.amount_inr ELSE 0 END) as total_revenue
      FROM plans p
      LEFT JOIN subscriptions s 
        ON p.id = s.plan_id AND s.status = 'active'
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ${connection.escape(limit)} OFFSET ${connection.escape(offset)}
    `;
    
    const [plans] = await connection.execute(dataQuery, queryParams);
    
    res.json({
      plans,
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


// @route   GET /api/plans/active
// @desc    Get all active plans (public endpoint for plan selection)
// @access  Private
router.get('/active', asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [plans] = await connection.execute(`
      SELECT 
        id,
        name,
        description,
        price_inr,
        currency,
        billing_cycle,
        features,
        module_access,
        max_users,
        max_clients
      FROM plans 
      WHERE is_active = true 
      ORDER BY price_inr ASC
    `);

    res.json({ plans });
  } finally {
    connection.release();
  }
}));

// @route   GET /api/plans/:id
// @desc    Get plan by ID
// @access  Private
router.get('/:id', validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [plans] = await connection.execute(`
      SELECT 
        p.*,
        COUNT(DISTINCT s.id) as total_subscriptions,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
        SUM(CASE WHEN s.status = 'active' THEN s.amount_inr ELSE 0 END) as total_revenue
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [req.params.id]);

    if (plans.length === 0) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'The specified plan does not exist'
      });
    }

    const plan = plans[0];

    // Get recent subscriptions for this plan
    const [recentSubscriptions] = await connection.execute(`
      SELECT 
        s.id,
        s.status,
        s.payment_status,
        s.start_date,
        s.end_date,
        s.amount_inr,
        c.company_name,
        c.contact_person
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      WHERE s.plan_id = ?
      ORDER BY s.created_at DESC
      LIMIT 10
    `, [req.params.id]);

    plan.recent_subscriptions = recentSubscriptions;

    res.json({ plan });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/plans
// @desc    Create new plan
// @access  Private (Admin only)
router.post('/', authorizeRole('admin'), validatePlan, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      name,
      description,
      price_inr,
      billing_cycle,
      features = [],
      module_access = {},
      max_users = 1,
      max_clients = 10,
      is_active = true
    } = req.body;

    // Check if plan with same name already exists
    const [existingPlans] = await connection.execute(
      'SELECT id FROM plans WHERE name = ?',
      [name]
    );

    if (existingPlans.length > 0) {
      return res.status(409).json({
        error: 'Plan already exists',
        message: 'A plan with this name already exists'
      });
    }

    // Create plan
    const [result] = await connection.execute(`
      INSERT INTO plans (
        name, description, price_inr, currency, billing_cycle, 
        features, module_access, max_users, max_clients, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, 
      description, 
      price_inr, 
      'INR', 
      billing_cycle,
      JSON.stringify(features),
      JSON.stringify(module_access),
      max_users,
      max_clients,
      is_active
    ]);

    // Get created plan
    const [newPlan] = await connection.execute(
      'SELECT * FROM plans WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Plan created successfully',
      plan: newPlan[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   PUT /api/plans/:id
// @desc    Update plan
// @access  Private (Admin only)
router.put('/:id', validateId, authorizeRole('admin'), validatePlan, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      name,
      description,
      price_inr,
      billing_cycle,
      features,
      module_access,
      max_users,
      max_clients,
      is_active
    } = req.body;

    // Check if plan exists
    const [existingPlans] = await connection.execute(
      'SELECT id FROM plans WHERE id = ?',
      [req.params.id]
    );

    if (existingPlans.length === 0) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'The specified plan does not exist'
      });
    }

    // Check if name is being changed and if it already exists
    const [nameExists] = await connection.execute(
      'SELECT id FROM plans WHERE name = ? AND id != ?',
      [name, req.params.id]
    );

    if (nameExists.length > 0) {
      return res.status(409).json({
        error: 'Plan name already exists',
        message: 'Another plan with this name already exists'
      });
    }

    // Update plan
    await connection.execute(`
      UPDATE plans SET
        name = ?, description = ?, price_inr = ?, billing_cycle = ?,
        features = ?, module_access = ?, max_users = ?, max_clients = ?, is_active = ?
      WHERE id = ?
    `, [
      name,
      description,
      price_inr,
      billing_cycle,
      JSON.stringify(features),
      JSON.stringify(module_access),
      max_users,
      max_clients,
      is_active,
      req.params.id
    ]);

    // Get updated plan
    const [updatedPlan] = await connection.execute(
      'SELECT * FROM plans WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Plan updated successfully',
      plan: updatedPlan[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   DELETE /api/plans/:id
// @desc    Delete plan (soft delete by setting is_active to false)
// @access  Private (Admin only)
router.delete('/:id', validateId, authorizeRole('admin'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Check if plan exists
    const [plans] = await connection.execute(
      'SELECT id, name FROM plans WHERE id = ?',
      [req.params.id]
    );

    if (plans.length === 0) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'The specified plan does not exist'
      });
    }

    // Check if plan has active subscriptions
    const [activeSubscriptions] = await connection.execute(
      'SELECT id FROM subscriptions WHERE plan_id = ? AND status = "active"',
      [req.params.id]
    );

    if (activeSubscriptions.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete plan',
        message: 'Plan has active subscriptions. Please move subscribers to another plan before deleting.'
      });
    }

    // Soft delete by setting is_active to false
    await connection.execute(
      'UPDATE plans SET is_active = false WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Plan deactivated successfully'
    });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/plans/:id/activate
// @desc    Activate a deactivated plan
// @access  Private (Admin only)
router.post('/:id/activate', validateId, authorizeRole('admin'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Check if plan exists
    const [plans] = await connection.execute(
      'SELECT id, name, is_active FROM plans WHERE id = ?',
      [req.params.id]
    );

    if (plans.length === 0) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'The specified plan does not exist'
      });
    }

    if (plans[0].is_active) {
      return res.status(400).json({
        error: 'Plan already active',
        message: 'The plan is already active'
      });
    }

    // Activate plan
    await connection.execute(
      'UPDATE plans SET is_active = true WHERE id = ?',
      [req.params.id]
    );

    // Get updated plan
    const [updatedPlan] = await connection.execute(
      'SELECT * FROM plans WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Plan activated successfully',
      plan: updatedPlan[0]
    });
  } finally {
    connection.release();
  }
}));

// @route   GET /api/plans/stats/overview
// @desc    Get plan statistics
// @access  Private (Admin/Manager only)
router.get('/stats/overview', authorizeRole('admin', 'manager'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Get plan statistics
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_plans,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_plans,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_plans,
        AVG(price_inr) as average_plan_price,
        MIN(price_inr) as min_plan_price,
        MAX(price_inr) as max_plan_price
      FROM plans
    `);

    // Get subscription distribution by plan
    const [planSubscriptions] = await connection.execute(`
      SELECT 
        p.id,
        p.name,
        p.price_inr,
        p.billing_cycle,
        COUNT(s.id) as total_subscriptions,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
        SUM(CASE WHEN s.status = 'active' THEN s.amount_inr ELSE 0 END) as monthly_revenue
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.price_inr, p.billing_cycle
      ORDER BY active_subscriptions DESC
    `);

    // Get billing cycle distribution
    const [billingStats] = await connection.execute(`
      SELECT 
        billing_cycle,
        COUNT(*) as plan_count,
        AVG(price_inr) as average_price
      FROM plans
      WHERE is_active = true
      GROUP BY billing_cycle
    `);

    // Get feature usage statistics
    const [featureStats] = await connection.execute(`
      SELECT 
        p.name,
        p.features,
        p.module_access,
        COUNT(s.id) as subscription_count
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.status = 'active'
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.features, p.module_access
      ORDER BY subscription_count DESC
    `);

    res.json({
      overview: stats[0],
      plan_subscriptions: planSubscriptions,
      billing_distribution: billingStats,
      feature_usage: featureStats
    });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/plans/:id/duplicate
// @desc    Duplicate an existing plan
// @access  Private (Admin only)
router.post('/:id/duplicate', validateId, authorizeRole('admin'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Get original plan
    const [originalPlans] = await connection.execute(
      'SELECT * FROM plans WHERE id = ?',
      [req.params.id]
    );

    if (originalPlans.length === 0) {
      return res.status(404).json({
        error: 'Plan not found',
        message: 'The specified plan does not exist'
      });
    }

    const originalPlan = originalPlans[0];
    const newName = `${originalPlan.name} - Copy`;

    // Check if duplicated name already exists
    let suffix = 1;
    let finalName = newName;
    while (true) {
      const [nameCheck] = await connection.execute(
        'SELECT id FROM plans WHERE name = ?',
        [finalName]
      );
      
      if (nameCheck.length === 0) break;
      
      finalName = `${newName} ${suffix}`;
      suffix++;
    }

    // Create duplicate plan
    const [result] = await connection.execute(`
      INSERT INTO plans (
        name, description, price_inr, currency, billing_cycle,
        features, module_access, max_users, max_clients, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalName,
      originalPlan.description,
      originalPlan.price_inr,
      originalPlan.currency,
      originalPlan.billing_cycle,
      originalPlan.features,
      originalPlan.module_access,
      originalPlan.max_users,
      originalPlan.max_clients,
      false // Duplicate is inactive by default
    ]);

    // Get created plan
    const [newPlan] = await connection.execute(
      'SELECT * FROM plans WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Plan duplicated successfully',
      plan: newPlan[0]
    });
  } finally {
    connection.release();
  }
}));

module.exports = router;