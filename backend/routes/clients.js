const express = require("express");
const { pool } = require("../config/database");
const {
  authenticateToken,
  authorizeRole,
  authorizeClient,
} = require("../middleware/auth");
const {
  validateClient,
  validateId,
  validatePagination,
} = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/clients
// @desc    Get all clients with pagination and filtering
// @access  Private (Admin/Manager can see all, User sees only their clients)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 500); // prevent abuse
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const status = req.query.status || "";
      const industry = req.query.industry || "";
      const company_size = req.query.company_size || "";

      // Base query conditions
      let whereConditions = [];
      let queryParams = [];

      // Role-based access control
      if (req.user.role === "user") {
        whereConditions.push("c.created_by = ?");
        queryParams.push(req.user.id);
      }

      // Search filter
      if (search) {
        whereConditions.push(
          "(c.company_name LIKE ? OR c.contact_person LIKE ? OR c.email LIKE ?)"
        );
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Status filter
      if (status) {
        whereConditions.push("c.status = ?");
        queryParams.push(status);
      }

      // Industry filter
      if (industry) {
        whereConditions.push("c.industry = ?");
        queryParams.push(industry);
      }

      // Company size filter
      if (company_size) {
        whereConditions.push("c.company_size = ?");
        queryParams.push(company_size);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count
      const countQuery = `
      SELECT COUNT(*) as total 
      FROM clients c 
      ${whereClause}
    `;
      const [countResult] = await connection.execute(countQuery, queryParams);
      const total = countResult[0].total;

      // Get clients with pagination
      const dataQuery = `
  SELECT 
    c.*,
    c.company_name AS client_name,
    c.email AS client_email,
    u.first_name as created_by_name,
    u.last_name as created_by_lastname,
    COUNT(DISTINCT s.id) as active_subscriptions
  FROM clients c
  LEFT JOIN users u ON c.created_by = u.id
  LEFT JOIN subscriptions s ON c.id = s.client_id AND s.status = 'active'
  
  ${whereClause}
  GROUP BY c.id
  ORDER BY c.created_at DESC
  LIMIT ${limit} OFFSET ${offset}
`;

      const [clients] = await connection.execute(dataQuery, [
        ...queryParams,
        limit,
        offset,
      ]);

      res.json({
        clients,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_records: total,
          records_per_page: limit,
          has_next: page < Math.ceil(total / limit),
          has_prev: page > 1,
        },
      });
    } finally {
      connection.release();
    }
  })
);

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get(
  "/:id",
  validateId,
  authorizeClient,
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const [clients] = await connection.execute(
        `
      SELECT 
        c.*,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM clients c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `,
        [req.params.id]
      );

      if (clients.length === 0) {
        return res.status(404).json({
          error: "Client not found",
          message: "The specified client does not exist",
        });
      }

      // Get client's subscriptions
      const [subscriptions] = await connection.execute(
        `
      SELECT 
        s.*,
        p.name as plan_name,
        p.features,
        p.module_access
      FROM subscriptions s
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE s.client_id = ?
      ORDER BY s.created_at DESC
    `,
        [req.params.id]
      );

      const client = clients[0];
      client.subscriptions = subscriptions;

      res.json({ client });
    } finally {
      connection.release();
    }
  })
);

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const {
        company_name,
        contact_person,
        email,
        phone,
        address,
        city,
        state,
        country,
        pincode,
        gst_number,
        pan_number,
        industry,
        company_size,
        status,
        notes,
      } = req.body;

      console.log("req.body", req.body);

      // Check if client with same email already exists
      const [existingClients] = await connection.execute(
        "SELECT id FROM clients WHERE email = ?",
        [email]
      );

      if (existingClients.length > 0) {
        return res.status(409).json({
          error: "Client already exists",
          message: "A client with this email address already exists",
        });
      }

      // Create client
      const [result] = await connection.execute(
        `
      INSERT INTO clients (
        company_name, contact_person, email, phone, address, city, state, country,
        pincode, gst_number, pan_number, industry, company_size, status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [
          company_name,
          contact_person,
          email,
          phone,
          address,
          city,
          state,
          country,
          pincode,
          gst_number,
          pan_number,
          industry,
          company_size,
          status,
          notes,
          req.user.id,
        ]
      );

      // Get created client
      const [newClient] = await connection.execute(
        `
      SELECT 
        c.*,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM clients c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `,
        [result.insertId]
      );

      res.status(201).json({
        message: "Client created successfully",
        client: newClient[0],
      });
    } finally {
      connection.release();
    }
  })
);

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put(
  "/:id",
  validateId,
  authorizeClient,
  validateClient,
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const {
        company_name,
        contact_person,
        email,
        phone,
        address,
        city,
        state,
        country,
        pincode,
        gst_number,
        pan_number,
        industry,
        company_size,
        status,
        notes,
      } = req.body;

      // Check if email is being changed and if it already exists
      const [existingClients] = await connection.execute(
        "SELECT id FROM clients WHERE email = ? AND id != ?",
        [email, req.params.id]
      );

      if (existingClients.length > 0) {
        return res.status(409).json({
          error: "Email already exists",
          message: "Another client with this email address already exists",
        });
      }

      // Update client
      await connection.execute(
        `
      UPDATE clients SET
        company_name = ?, contact_person = ?, email = ?, phone = ?, address = ?,
        city = ?, state = ?, country = ?, pincode = ?, gst_number = ?, pan_number = ?,
        industry = ?, company_size = ?, status = ?, notes = ?
      WHERE id = ?
    `,
        [
          company_name,
          contact_person,
          email,
          phone,
          address,
          city,
          state,
          country,
          pincode,
          gst_number,
          pan_number,
          industry,
          company_size,
          status,
          notes,
          req.params.id,
        ]
      );

      // Get updated client
      const [updatedClient] = await connection.execute(
        `
      SELECT 
        c.*,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM clients c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `,
        [req.params.id]
      );

      res.json({
        message: "Client updated successfully",
        client: updatedClient[0],
      });
    } finally {
      connection.release();
    }
  })
);

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private (Admin/Manager only)
router.delete(
  "/:id",
  validateId,
  authorizeRole("admin", "manager"),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if client has active subscriptions
      const [activeSubscriptions] = await connection.execute(
        'SELECT id FROM subscriptions WHERE client_id = ? AND status = "active"',
        [req.params.id]
      );

      if (activeSubscriptions.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          error: "Cannot delete client",
          message:
            "Client has active subscriptions. Please cancel all subscriptions before deleting.",
        });
      }

      // Check if client exists
      const [clients] = await connection.execute(
        "SELECT id FROM clients WHERE id = ?",
        [req.params.id]
      );

      if (clients.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          error: "Client not found",
          message: "The specified client does not exist",
        });
      }

      // Delete client (this will cascade delete subscriptions and HRMS logs)
      await connection.execute("DELETE FROM clients WHERE id = ?", [
        req.params.id,
      ]);

      await connection.commit();

      res.json({
        message: "Client deleted successfully",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

// @route   GET /api/clients/stats/overview
// @desc    Get client statistics overview
// @access  Private
router.get(
  "/stats/overview",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();

    try {
      let whereCondition = "";
      let queryParams = [];

      // Role-based access control
      if (req.user.role === "user") {
        whereCondition = "WHERE c.created_by = ?";
        queryParams.push(req.user.id);
      }

      // Get client statistics
      const [stats] = await connection.execute(
        `
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN c.status = 'active' THEN 1 END) as active_clients,
        COUNT(CASE WHEN c.status = 'inactive' THEN 1 END) as inactive_clients,
        COUNT(CASE WHEN c.status = 'suspended' THEN 1 END) as suspended_clients,
        COUNT(CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_clients_this_month
      FROM clients c
      ${whereCondition}
    `,
        queryParams
      );

      // Get subscription statistics
      const [subscriptionStats] = await connection.execute(
        `
      SELECT 
        COUNT(DISTINCT s.client_id) as clients_with_subscriptions,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
        SUM(CASE WHEN s.status = 'active' THEN s.amount_inr ELSE 0 END) as total_monthly_revenue
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      ${whereCondition}
    `,
        queryParams
      );

      // Get industry distribution
      const [industryStats] = await connection.execute(
        `
      SELECT 
        industry,
        COUNT(*) as count
      FROM clients c
      ${whereCondition}
      GROUP BY industry
      ORDER BY count DESC
      LIMIT 5
    `,
        queryParams
      );

      res.json({
        overview: {
          ...stats[0],
          ...subscriptionStats[0],
        },
        industry_distribution: industryStats,
      });
    } finally {
      connection.release();
    }
  })
);

module.exports = router;
