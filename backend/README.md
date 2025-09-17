# CRM HRMS Backend API

A comprehensive Node.js backend API for managing CRM data with HRMS integration, built with Express.js and MySQL.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control
- 🏢 **Client Management**: Complete CRUD operations for client data
- 📋 **Subscription Management**: Handle subscriptions with active/paid status tracking
- 📦 **Plan Management**: Manage Starter, Pro, and Enterprise plans with different module access
- 🔄 **HRMS Integration**: Sync data with external HRMS systems
- 👥 **User Management**: Multi-role user system (Admin, Manager, User)
- 📊 **Analytics**: Comprehensive statistics and reporting
- 💱 **Indian Rupee Support**: All pricing in INR currency
- 🛡️ **Security**: Rate limiting, input validation, and SQL injection prevention

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 16+ 
- MySQL 8.0+
- npm or yarn

## Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your database and other configurations:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=crm_hrms
   DB_USER=root
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # HRMS API Configuration
   HRMS_API_URL=http://localhost:3001/api
   HRMS_API_KEY=your_hrms_api_key_here
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

5. **Initialize database**
   ```bash
   npm run init-db
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token

### Users Management
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin)
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/status` - Activate/Deactivate user (Admin)
- `PUT /api/users/:id/password` - Reset user password (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/stats/overview` - Get user statistics

### Clients Management
- `GET /api/clients` - Get all clients with pagination
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client (Admin/Manager)
- `GET /api/clients/stats/overview` - Get client statistics

### Subscriptions Management
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription
- `POST /api/subscriptions/:id/renew` - Renew subscription
- `GET /api/subscriptions/stats/overview` - Get subscription statistics

### Plans Management
- `GET /api/plans` - Get all plans
- `GET /api/plans/active` - Get active plans
- `GET /api/plans/:id` - Get plan by ID
- `POST /api/plans` - Create new plan (Admin)
- `PUT /api/plans/:id` - Update plan (Admin)
- `DELETE /api/plans/:id` - Deactivate plan (Admin)
- `POST /api/plans/:id/activate` - Activate plan (Admin)
- `POST /api/plans/:id/duplicate` - Duplicate plan (Admin)
- `GET /api/plans/stats/overview` - Get plan statistics

### HRMS Integration
- `POST /api/hrms/sync/client/:id` - Sync client with HRMS
- `POST /api/hrms/sync/subscription/:id` - Sync subscription with HRMS
- `POST /api/hrms/validate/access` - Validate user access (API Key required)
- `GET /api/hrms/logs/:clientId` - Get HRMS integration logs
- `POST /api/hrms/webhook/subscription-update` - HRMS webhook endpoint
- `GET /api/hrms/stats/integration` - Get integration statistics
- `POST /api/hrms/test/connection` - Test HRMS connection (Admin)

## Database Schema

### Main Tables
- **users**: System users with role-based access
- **clients**: Client company information
- **plans**: Subscription plans (Starter, Pro, Enterprise)
- **subscriptions**: Client subscriptions with payment tracking
- **hrms_integration_log**: HRMS sync activity logs
- **user_sessions**: JWT token management

### Key Features
- Foreign key relationships for data integrity
- Indexes for performance optimization
- JSON fields for flexible plan features and module access
- Comprehensive audit trails

## Authentication & Authorization

### Roles
- **Admin**: Full system access
- **Manager**: Can manage clients and subscriptions
- **User**: Can only manage their own clients

### JWT Token Management
- Secure token generation with expiration
- Token blacklisting for logout
- Session tracking in database
- Automatic cleanup of expired sessions

## Default Plans

The system comes with three pre-configured plans:

### Starter Plan (₹999/month)
- Basic HR Management
- Employee Records
- Leave Management
- Basic Reporting
- Email Support
- Max 5 users, 10 clients

### Pro Plan (₹2,499/month)
- Advanced HR Management
- Payroll Processing
- Time & Attendance
- Performance Management
- Advanced Reporting
- API Access
- Priority Support
- Max 25 users, 50 clients

### Enterprise Plan (₹4,999/month)
- Complete HR Suite
- Advanced Payroll
- Biometric Integration
- Custom Workflows
- Advanced Analytics
- Full API Access
- Dedicated Support
- Custom Integrations
- Unlimited users and clients

## Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configurable cross-origin policies
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## Error Handling

- Centralized error handling middleware
- Detailed error logging
- User-friendly error messages
- HTTP status code standards
- Development vs production error details

## Performance Features

- Database connection pooling
- Pagination for large datasets
- Indexed database queries
- Response compression
- Efficient SQL queries with JOINs

## Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run init-db    # Initialize database with default data
```

### Default Admin Account
- **Email**: admin@crm-hrms.com
- **Password**: admin123
- **Role**: Admin

⚠️ **Important**: Change the default admin password after first login!

## API Testing

Use tools like Postman or Thunder Client to test the API endpoints. Authentication is required for most endpoints.

### Authentication Headers
```
Authorization: Bearer <your_jwt_token>
```

### HRMS Integration Headers
```
X-API-Key: <your_hrms_api_key>
```

## Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Set secure JWT secret
4. Configure proper CORS origins
5. Set up SSL/TLS certificates
6. Configure reverse proxy (nginx/Apache)
7. Set up process manager (PM2)

## Contributing

1. Follow existing code style and patterns
2. Add appropriate error handling
3. Include input validation
4. Write comprehensive logs
5. Test all endpoints thoroughly

## License

This project is licensed under the MIT License.