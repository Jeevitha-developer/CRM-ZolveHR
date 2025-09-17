const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_hrms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database and create tables
async function initializeDatabase() {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to database');
    }

    // Create tables
    await createTables();
    await insertDefaultData();
    
    console.log('🏗️  Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Create all required tables
async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'manager', 'user') DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_active (is_active)
      )
    `);

    // Plans table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price_inr DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        billing_cycle ENUM('monthly', 'yearly') NOT NULL,
        features JSON,
        module_access JSON,
        max_users INT DEFAULT 1,
        max_clients INT DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_active (is_active)
      )
    `);

    // Clients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'India',
        pincode VARCHAR(10),
        gst_number VARCHAR(20),
        pan_number VARCHAR(20),
        industry VARCHAR(100),
        company_size ENUM('1-10', '11-50', '51-200', '201-500', '500+') DEFAULT '1-10',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_company_name (company_name),
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_by (created_by)
      )
    `);

    // Subscriptions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        plan_id INT NOT NULL,
        status ENUM('active', 'inactive', 'suspended', 'cancelled', 'expired') DEFAULT 'active',
        payment_status ENUM('paid', 'pending', 'overdue', 'failed') DEFAULT 'pending',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        amount_inr DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        billing_cycle ENUM('monthly', 'yearly') NOT NULL,
        auto_renewal BOOLEAN DEFAULT true,
        last_payment_date DATE NULL,
        next_payment_date DATE NULL,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(100),
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_client_id (client_id),
        INDEX idx_plan_id (plan_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_dates (start_date, end_date),
        INDEX idx_created_by (created_by)
      )
    `);

    // HRMS Integration Log table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hrms_integration_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        subscription_id INT,
        action VARCHAR(100) NOT NULL,
        status ENUM('success', 'failed', 'pending') NOT NULL,
        request_data JSON,
        response_data JSON,
        error_message TEXT,
        hrms_user_id VARCHAR(100),
        sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
        INDEX idx_client_id (client_id),
        INDEX idx_subscription_id (subscription_id),
        INDEX idx_status (status),
        INDEX idx_action (action),
        INDEX idx_sync_timestamp (sync_timestamp)
      )
    `);

    // User Sessions table (for JWT token blacklisting)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT true,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires_at (expires_at),
        INDEX idx_active (is_active)
      )
    `);

    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Insert default data
async function insertDefaultData() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Check if default admin user exists
    const [adminExists] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@crm-hrms.com']
    );

    if (adminExists.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(`
        INSERT INTO users (email, password, first_name, last_name, role)
        VALUES (?, ?, ?, ?, ?)
      `, ['admin@crm-hrms.com', hashedPassword, 'System', 'Administrator', 'admin']);
      
      console.log('✅ Default admin user created');
    }

    // Check if default plans exist
    const [plansExist] = await connection.execute('SELECT id FROM plans LIMIT 1');
    
    if (plansExist.length === 0) {
      const defaultPlans = [
        {
          name: 'Starter',
          description: 'Perfect for small businesses getting started',
          price_inr: 999.00,
          billing_cycle: 'monthly',
          features: JSON.stringify([
            'Basic HR Management',
            'Employee Records',
            'Leave Management',
            'Basic Reporting',
            'Email Support'
          ]),
          module_access: JSON.stringify({
            hr: true,
            payroll: false,
            attendance: true,
            reports: 'basic',
            integrations: false
          }),
          max_users: 5,
          max_clients: 10
        },
        {
          name: 'Pro',
          description: 'Advanced features for growing businesses',
          price_inr: 2499.00,
          billing_cycle: 'monthly',
          features: JSON.stringify([
            'Advanced HR Management',
            'Payroll Processing',
            'Time & Attendance',
            'Performance Management',
            'Advanced Reporting',
            'API Access',
            'Priority Support'
          ]),
          module_access: JSON.stringify({
            hr: true,
            payroll: true,
            attendance: true,
            performance: true,
            reports: 'advanced',
            integrations: true
          }),
          max_users: 25,
          max_clients: 50
        },
        {
          name: 'Enterprise',
          description: 'Complete solution for large organizations',
          price_inr: 4999.00,
          billing_cycle: 'monthly',
          features: JSON.stringify([
            'Complete HR Suite',
            'Advanced Payroll',
            'Biometric Integration',
            'Custom Workflows',
            'Advanced Analytics',
            'Full API Access',
            'Dedicated Support',
            'Custom Integrations'
          ]),
          module_access: JSON.stringify({
            hr: true,
            payroll: true,
            attendance: true,
            performance: true,
            analytics: true,
            workflows: true,
            reports: 'enterprise',
            integrations: true,
            customization: true
          }),
          max_users: -1, // Unlimited
          max_clients: -1 // Unlimited
        }
      ];

      for (const plan of defaultPlans) {
        await connection.execute(`
          INSERT INTO plans (name, description, price_inr, billing_cycle, features, module_access, max_users, max_clients)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          plan.name,
          plan.description,
          plan.price_inr,
          plan.billing_cycle,
          plan.features,
          plan.module_access,
          plan.max_users,
          plan.max_clients
        ]);
      }
      
      console.log('✅ Default plans created');
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error inserting default data:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Clean up expired sessions periodically
setInterval(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = false'
    );
    connection.release();
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error.message);
  }
}, 60000 * 60); // Clean up every hour

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};