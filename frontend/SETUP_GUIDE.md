# HRMS CRM Setup Guide

This guide will help you set up and run the complete HRMS CRM system with backend API integration.

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- Git

## Quick Start

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=crm_hrms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# HRMS Integration
HRMS_API_URL=http://localhost:3001/api
HRMS_API_KEY=hrms-integration-key-2024
```

Initialize the database:

```bash
npm run init-db
```

Start the backend server:

```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### 2. Frontend Setup

In the root directory, install dependencies:

```bash
npm install
```

The `.env` file is already configured to connect to `http://localhost:5000/api`

Start the frontend development server:

```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## API Endpoints

Your backend provides the following main endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Clients
- `GET /api/clients` - Get all clients (with pagination and filters)
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/stats/overview` - Get client statistics

### Plans
- `GET /api/plans` - Get all plans
- `GET /api/plans/active` - Get active plans only
- `GET /api/plans/:id` - Get plan by ID
- `POST /api/plans` - Create new plan (Admin only)
- `PUT /api/plans/:id` - Update plan (Admin only)
- `DELETE /api/plans/:id` - Delete/deactivate plan (Admin only)

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### HRMS Integration
- `POST /api/hrms/sync/client/:id` - Sync client with HRMS
- `POST /api/hrms/sync/subscription/:id` - Sync subscription with HRMS
- `POST /api/hrms/validate/access` - Validate user access
- `GET /api/hrms/logs/:clientId` - Get HRMS integration logs
- `POST /api/hrms/test/connection` - Test HRMS connection

## Features

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Manager, User)
- Secure password hashing
- Session management

### ✅ Client Management
- Complete CRUD operations for clients
- Search and filtering
- Industry and company size categorization
- GST and PAN number validation

### ✅ Subscription Management
- Plan-based subscriptions
- Payment status tracking
- Auto-renewal management
- Indian Rupee pricing

### ✅ Plan Management
- Flexible plan creation
- Module access control
- Feature-based restrictions
- Billing cycle options (Monthly, Quarterly, Yearly)

### ✅ HRMS Integration
- Real-time sync with HRMS systems
- Access validation based on subscriptions
- Activity logging
- Webhook support for real-time updates

### ✅ Dashboard & Analytics
- Comprehensive statistics
- Revenue tracking
- Subscription analytics
- Client insights

## Default Data

The system comes with pre-configured plans:

1. **Starter Plan** - ₹2,500/month
   - Basic user management
   - Basic reporting
   - Up to 10 users

2. **Pro Plan** - ₹6,500/month
   - Advanced reporting
   - Payroll management
   - Leave management
   - Up to 50 users
   - API access

3. **Enterprise Plan** - ₹16,500/month
   - Complete HR suite
   - Custom integrations
   - Performance management
   - Unlimited users
   - Priority support

## Development Tips

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Login to get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'

# Use token for authenticated requests
curl -X GET http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Database Management
View your database using tools like:
- MySQL Workbench
- phpMyAdmin
- DBeaver

### Debugging
- Backend logs are available in the console
- Frontend errors appear in browser DevTools
- Check network tab for API call details

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use proper database credentials
3. Set secure JWT_SECRET
4. Configure CORS for your domain
5. Use process manager like PM2

### Frontend
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure API_URL for production
4. Set up HTTPS

## Troubleshooting

### Common Issues

1. **Connection Refused Error**
   - Ensure backend is running on port 5000
   - Check database connection

2. **CORS Errors**
   - Verify FRONTEND_URL in backend .env
   - Check CORS configuration

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration

4. **Database Errors**
   - Ensure database exists and user has permissions
   - Run database initialization script

### Support

For issues or questions:
1. Check the console logs (backend and frontend)
2. Verify all environment variables are set
3. Ensure database is properly initialized
4. Check API endpoint responses in network tab

## Next Steps

Once you have the system running:

1. Create user accounts via the registration endpoint
2. Set up your plans and pricing
3. Add your client data
4. Configure HRMS integration settings
5. Test the subscription workflows
6. Monitor the analytics dashboard

The system is now ready for your HRMS integration needs with full API connectivity!