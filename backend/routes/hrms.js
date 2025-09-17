const express = require('express');
const axios = require('axios');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole, validateApiKey } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// HRMS API configuration
const HRMS_API_BASE_URL = process.env.HRMS_API_URL || 'http://localhost:3001/api';
const HRMS_API_KEY = process.env.HRMS_API_KEY || 'hrms-integration-key-2024';

// Create axios instance for HRMS API calls
const hrmsAPI = axios.create({
  baseURL: HRMS_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': HRMS_API_KEY
  }
});

// Log HRMS integration activity
async function logHRMSActivity(clientId, subscriptionId, action, status, requestData, responseData, errorMessage = null, hrmsUserId = null) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      INSERT INTO hrms_integration_log (
        client_id, subscription_id, action, status, request_data, response_data, error_message, hrms_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clientId,
      subscriptionId,
      action,
      status,
      JSON.stringify(requestData),
      JSON.stringify(responseData),
      errorMessage,
      hrmsUserId
    ]);
  } catch (error) {
    console.error('Error logging HRMS activity:', error);
  } finally {
    connection.release();
  }
}

// @route   POST /api/hrms/sync/client/:id
// @desc    Sync client data with HRMS
// @access  Private
router.post('/sync/client/:id', authenticateToken, validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Get client data
    const [clients] = await connection.execute(`
      SELECT c.*, s.id as subscription_id, s.status as subscription_status, 
             p.name as plan_name, p.module_access
      FROM clients c
      LEFT JOIN subscriptions s ON c.id = s.client_id AND s.status = 'active'
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (clients.length === 0) {
      return res.status(404).json({
        error: 'Client not found',
        message: 'The specified client does not exist'
      });
    }

    const client = clients[0];

    // Role-based access control
    if (req.user.role === 'user') {
      const [clientAccess] = await connection.execute(
        'SELECT created_by FROM clients WHERE id = ?',
        [req.params.id]
      );
      
      if (clientAccess.length === 0 || clientAccess[0].created_by !== req.user.id) {
        return res.status(403).json({
          error: 'Access forbidden',
          message: 'You do not have permission to sync this client'
        });
      }
    }

    // Prepare HRMS data
    const hrmsData = {
      company_id: client.id,
      company_name: client.company_name,
      contact_person: client.contact_person,
      email: client.email,
      phone: client.phone,
      address: {
        street: client.address,
        city: client.city,
        state: client.state,
        country: client.country,
        pincode: client.pincode
      },
      gst_number: client.gst_number,
      pan_number: client.pan_number,
      industry: client.industry,
      company_size: client.company_size,
      subscription: {
        status: client.subscription_status,
        plan_name: client.plan_name,
        module_access: client.module_access ? JSON.parse(client.module_access) : {}
      },
      sync_timestamp: new Date().toISOString()
    };

    try {
      // Make API call to HRMS
      const response = await hrmsAPI.post('/companies/sync', hrmsData);
      
      await logHRMSActivity(
        client.id,
        client.subscription_id,
        'client_sync',
        'success',
        hrmsData,
        response.data,
        null,
        response.data.hrms_user_id || null
      );

      res.json({
        message: 'Client synced successfully with HRMS',
        hrms_response: response.data,
        sync_status: 'success'
      });
    } catch (hrmsError) {
      const errorMessage = hrmsError.response?.data?.message || hrmsError.message;
      
      await logHRMSActivity(
        client.id,
        client.subscription_id,
        'client_sync',
        'failed',
        hrmsData,
        hrmsError.response?.data || {},
        errorMessage
      );

      res.status(500).json({
        error: 'HRMS sync failed',
        message: errorMessage,
        sync_status: 'failed'
      });
    }
  } finally {
    connection.release();
  }
}));

// @route   POST /api/hrms/validate/access
// @desc    Validate user access in HRMS based on subscription
// @access  Public (with API key)
router.post('/validate/access', validateApiKey, asyncHandler(async (req, res) => {
  const { client_id, user_email, module } = req.body;
  
  if (!client_id || !user_email) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Client ID and user email are required'
    });
  }

  const connection = await pool.getConnection();
  
  try {
    // Get client subscription and plan details
    const [subscriptions] = await connection.execute(`
      SELECT s.*, c.company_name, c.status as client_status, 
             p.name as plan_name, p.module_access, p.max_users
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE s.client_id = ? AND s.status = 'active' AND s.payment_status = 'paid'
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [client_id]);

    if (subscriptions.length === 0) {
      await logHRMSActivity(
        client_id,
        null,
        'access_validation',
        'failed',
        { client_id, user_email, module },
        {},
        'No active paid subscription found'
      );

      return res.status(403).json({
        access_granted: false,
        error: 'No active subscription',
        message: 'Client does not have an active paid subscription'
      });
    }

    const subscription = subscriptions[0];

    // Check if client is active
    if (subscription.client_status !== 'active') {
      await logHRMSActivity(
        client_id,
        subscription.id,
        'access_validation',
        'failed',
        { client_id, user_email, module },
        {},
        'Client account is not active'
      );

      return res.status(403).json({
        access_granted: false,
        error: 'Client inactive',
        message: 'Client account is not active'
      });
    }

    // Check subscription validity
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    
    if (now > endDate) {
      await logHRMSActivity(
        client_id,
        subscription.id,
        'access_validation',
        'failed',
        { client_id, user_email, module },
        {},
        'Subscription expired'
      );

      return res.status(403).json({
        access_granted: false,
        error: 'Subscription expired',
        message: 'Client subscription has expired'
      });
    }

    // Parse module access
    const moduleAccess = JSON.parse(subscription.module_access || '{}');
    
    // Check module access if module is specified
    let hasModuleAccess = true;
    if (module) {
      hasModuleAccess = moduleAccess[module] === true || 
                       (typeof moduleAccess[module] === 'string' && moduleAccess[module] !== 'none');
    }

    if (!hasModuleAccess) {
      await logHRMSActivity(
        client_id,
        subscription.id,
        'access_validation',
        'failed',
        { client_id, user_email, module },
        {},
        `Access denied for module: ${module}`
      );

      return res.status(403).json({
        access_granted: false,
        error: 'Module access denied',
        message: `Your plan does not include access to the ${module} module`
      });
    }

    const responseData = {
      access_granted: true,
      subscription_details: {
        plan_name: subscription.plan_name,
        subscription_status: subscription.status,
        payment_status: subscription.payment_status,
        end_date: subscription.end_date,
        max_users: subscription.max_users
      },
      module_access: moduleAccess,
      client_details: {
        company_name: subscription.company_name,
        client_status: subscription.client_status
      }
    };

    await logHRMSActivity(
      client_id,
      subscription.id,
      'access_validation',
      'success',
      { client_id, user_email, module },
      responseData,
      null,
      user_email
    );

    res.json(responseData);
  } finally {
    connection.release();
  }
}));

// @route   POST /api/hrms/sync/subscription/:id
// @desc    Sync subscription changes with HRMS
// @access  Private
router.post('/sync/subscription/:id', authenticateToken, validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Get subscription data
    const [subscriptions] = await connection.execute(`
      SELECT s.*, c.company_name, c.email as client_email, c.created_by,
             p.name as plan_name, p.module_access, p.max_users, p.max_clients
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN plans p ON s.plan_id = p.id
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
    if (req.user.role === 'user' && subscription.created_by !== req.user.id) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have permission to sync this subscription'
      });
    }

    // Prepare HRMS data
    const hrmsData = {
      subscription_id: subscription.id,
      client_id: subscription.client_id,
      company_name: subscription.company_name,
      client_email: subscription.client_email,
      plan_details: {
        name: subscription.plan_name,
        module_access: JSON.parse(subscription.module_access || '{}'),
        max_users: subscription.max_users,
        max_clients: subscription.max_clients
      },
      subscription_status: subscription.status,
      payment_status: subscription.payment_status,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      amount_inr: subscription.amount_inr,
      billing_cycle: subscription.billing_cycle,
      auto_renewal: subscription.auto_renewal,
      sync_timestamp: new Date().toISOString()
    };

    try {
      // Make API call to HRMS
      const response = await hrmsAPI.post('/subscriptions/sync', hrmsData);
      
      await logHRMSActivity(
        subscription.client_id,
        subscription.id,
        'subscription_sync',
        'success',
        hrmsData,
        response.data
      );

      res.json({
        message: 'Subscription synced successfully with HRMS',
        hrms_response: response.data,
        sync_status: 'success'
      });
    } catch (hrmsError) {
      const errorMessage = hrmsError.response?.data?.message || hrmsError.message;
      
      await logHRMSActivity(
        subscription.client_id,
        subscription.id,
        'subscription_sync',
        'failed',
        hrmsData,
        hrmsError.response?.data || {},
        errorMessage
      );

      res.status(500).json({
        error: 'HRMS sync failed',
        message: errorMessage,
        sync_status: 'failed'
      });
    }
  } finally {
    connection.release();
  }
}));

// @route   GET /api/hrms/logs/:clientId
// @desc    Get HRMS integration logs for a client
// @access  Private
router.get('/logs/:clientId', authenticateToken, validateId, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const action = req.query.action || '';
    const status = req.query.status || '';

    // Role-based access control
    if (req.user.role === 'user') {
      const [clientAccess] = await connection.execute(
        'SELECT created_by FROM clients WHERE id = ?',
        [req.params.clientId]
      );
      
      if (clientAccess.length === 0 || clientAccess[0].created_by !== req.user.id) {
        return res.status(403).json({
          error: 'Access forbidden',
          message: 'You do not have permission to view logs for this client'
        });
      }
    }

    // Build query
    let whereConditions = ['client_id = ?'];
    let queryParams = [req.params.clientId];

    if (action) {
      whereConditions.push('action = ?');
      queryParams.push(action);
    }

    if (status) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM hrms_integration_log ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get logs
    const [logs] = await connection.execute(`
      SELECT 
        h.*,
        c.company_name,
        s.status as subscription_status
      FROM hrms_integration_log h
      LEFT JOIN clients c ON h.client_id = c.id
      LEFT JOIN subscriptions s ON h.subscription_id = s.id
      ${whereClause}
      ORDER BY h.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    res.json({
      logs,
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

// @route   POST /api/hrms/webhook/subscription-update
// @desc    Handle webhook from HRMS for subscription updates
// @access  Public (with API key)
router.post('/webhook/subscription-update', validateApiKey, asyncHandler(async (req, res) => {
  const { client_id, subscription_id, user_data, module_usage, event_type } = req.body;
  
  if (!client_id || !event_type) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Client ID and event type are required'
    });
  }

  const connection = await pool.getConnection();
  
  try {
    // Log the webhook event
    await logHRMSActivity(
      client_id,
      subscription_id,
      `webhook_${event_type}`,
      'success',
      req.body,
      { received: true, processed: true }
    );

    // Process different event types
    switch (event_type) {
      case 'user_login':
        // Log user login activity
        break;
      
      case 'module_access':
        // Log module access attempt
        break;
      
      case 'usage_report':
        // Update usage statistics
        break;
      
      default:
        console.log(`Unknown webhook event type: ${event_type}`);
    }

    res.json({
      message: 'Webhook processed successfully',
      event_type,
      processed: true
    });
  } finally {
    connection.release();
  }
}));

// @route   GET /api/hrms/stats/integration
// @desc    Get HRMS integration statistics
// @access  Private (Admin/Manager only)
router.get('/stats/integration', authenticateToken, authorizeRole('admin', 'manager'), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Get integration statistics
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_sync_attempts,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_syncs,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_syncs,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as syncs_last_24h,
        COUNT(CASE WHEN action = 'client_sync' THEN 1 END) as client_syncs,
        COUNT(CASE WHEN action = 'subscription_sync' THEN 1 END) as subscription_syncs,
        COUNT(CASE WHEN action = 'access_validation' THEN 1 END) as access_validations
      FROM hrms_integration_log
    `);

    // Get recent failed syncs
    const [recentFailures] = await connection.execute(`
      SELECT 
        h.*,
        c.company_name
      FROM hrms_integration_log h
      LEFT JOIN clients c ON h.client_id = c.id
      WHERE h.status = 'failed'
      ORDER BY h.created_at DESC
      LIMIT 10
    `);

    // Get sync activity by day (last 7 days)
    const [dailyActivity] = await connection.execute(`
      SELECT 
        DATE(created_at) as sync_date,
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_attempts,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_attempts
      FROM hrms_integration_log
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY sync_date DESC
    `);

    res.json({
      overview: stats[0],
      recent_failures: recentFailures,
      daily_activity: dailyActivity
    });
  } finally {
    connection.release();
  }
}));

// @route   POST /api/hrms/test/connection
// @desc    Test HRMS API connection
// @access  Private (Admin only)
router.post('/test/connection', authenticateToken, authorizeRole('admin'), asyncHandler(async (req, res) => {
  try {
    const response = await hrmsAPI.get('/health');
    
    res.json({
      message: 'HRMS API connection successful',
      hrms_status: response.data,
      connection_time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'HRMS API connection failed',
      message: error.response?.data?.message || error.message,
      connection_time: new Date().toISOString()
    });
  }
}));

module.exports = router;