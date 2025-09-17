# Backend Setup Guide

Your HRMS CRM backend is already set up, but you need to initialize the database and start the server.

## 🚀 Quick Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (.env):**
   ```bash
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=crm_hrms

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Initialize the database:**
   ```bash
   node scripts/init-database.js
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

## 🔧 What the Setup Does

### Database Tables Created:
- ✅ **users** - User accounts with authentication
- ✅ **plans** - Subscription plans (Starter, Pro, Enterprise)
- ✅ **clients** - Client companies
- ✅ **subscriptions** - Client subscription management
- ✅ **hrms_integration_log** - HRMS sync logging
- ✅ **user_sessions** - JWT token management

### Default Data Inserted:
- ✅ **Admin User**: admin@crm-hrms.com / admin123
- ✅ **Plans**: Starter (₹999), Pro (₹2,499), Enterprise (₹4,999)

### API Endpoints Available:
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login
- ✅ `POST /api/auth/logout` - User logout
- ✅ `GET /api/auth/me` - Get current user
- ✅ `PUT /api/auth/profile` - Update profile
- ✅ `PUT /api/auth/password` - Change password
- ✅ Full CRUD for clients, plans, subscriptions
- ✅ HRMS integration endpoints

## 🐛 Troubleshooting

### Error: "Cannot read properties of undefined (reading 'register')"
This means the frontend can't reach the backend API.

**Solutions:**
1. Make sure MySQL is running
2. Check the .env file has correct database credentials
3. Run the database initialization script
4. Start the backend server on port 5000
5. Check frontend is making requests to http://localhost:5000

### Database Connection Issues:
- Ensure MySQL service is running
- Check username/password in .env
- Database name exists (crm_hrms)
- User has proper permissions

### Port Issues:
- Backend runs on port 5000
- Frontend dev server usually runs on port 3000
- Make sure nothing else is using port 5000

## 📝 Testing the Setup

1. **Check server is running:**
   ```bash
   curl http://localhost:5000/api/auth/me
   ```

2. **Test registration:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123","first_name":"John","last_name":"Doe"}'
   ```

3. **Test login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@crm-hrms.com","password":"admin123"}'
   ```

## ✅ Success Indicators

When everything is working, you should see:
- ✅ Database initialized with success message
- ✅ Server running on port 5000
- ✅ No console errors in frontend
- ✅ Registration form creates new users
- ✅ Login form authenticates users
- ✅ Dashboard loads after authentication

The registration system will work once the backend is properly running!