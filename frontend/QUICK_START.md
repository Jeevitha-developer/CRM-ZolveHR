# 🚀 Quick Start Guide

## ✅ **Registration Data Storage Clarification**

**No separate "register" table is needed!** Registration data is stored in the **`users` table**:

```sql
users table stores:
- id (primary key)
- email (unique)
- password (hashed)
- first_name
- last_name
- role (admin/manager/user)
- created_at, updated_at, etc.
```

## 🛠️ **Setup Steps**

### 1. **Prerequisites**
- ✅ MySQL server running
- ✅ Node.js installed
- ✅ Terminal/Command Prompt

### 2. **Backend Setup (Required for Registration)**

**Option A: Use the startup script**
```bash
# For Linux/Mac
chmod +x start-backend.sh
./start-backend.sh

# For Windows
start-backend.bat
```

**Option B: Manual setup**
```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Update .env file with your MySQL credentials
# Edit backend/.env:
DB_PASSWORD=your_mysql_password

# 4. Initialize database
npm run init-db

# 5. Start server
npm start
```

### 3. **What Gets Created**

✅ **Database:** `crm_hrms`  
✅ **Tables:** users, plans, clients, subscriptions, etc.  
✅ **Default Admin:** admin@crm-hrms.com / admin123  
✅ **API Endpoints:** Registration, login, logout, etc.  

### 4. **Frontend (Already Working)**

Your frontend login/register forms are already set up. Once the backend is running:

- ✅ **Registration creates real users** in the database
- ✅ **Login authenticates** against the database
- ✅ **JWT tokens** for session management
- ✅ **Role-based access** (admin/manager/user)

## 🎯 **Testing Registration**

1. **Start backend** (port 5000)
2. **Open frontend** (should be on port 3000)
3. **Click "Create one here"** to switch to registration
4. **Fill out the form** with valid data
5. **Submit** - user gets created in database
6. **Switch to login** and sign in with new credentials

## 🐛 **Troubleshooting**

### Error: "Cannot read properties of undefined (reading 'register')"
- ❌ Backend not running → Start backend server
- ❌ Wrong database credentials → Check .env file
- ❌ MySQL not running → Start MySQL service

### Database Connection Failed
- Check MySQL is running
- Verify credentials in .env
- Ensure database `crm_hrms` exists (script creates it)

### Port Issues
- Backend uses port 5000
- Frontend dev server uses port 3000
- Check nothing else is using these ports

## ✅ **Success Indicators**

When everything works:
- ✅ Backend logs: "✅ Database connected successfully"
- ✅ Backend logs: "✅ All tables created successfully"  
- ✅ Backend logs: "Server running on port 5000"
- ✅ Registration form creates new users
- ✅ Login works with created users
- ✅ No console errors in browser

## 📋 **Database Structure**

```
users (stores registration data)
├── id
├── email
├── password (hashed)
├── first_name
├── last_name
├── role
└── timestamps

plans (subscription plans)
├── Starter (₹999/month)
├── Pro (₹2,499/month)
└── Enterprise (₹4,999/month)

clients (companies)
subscriptions (client plans)
user_sessions (JWT tokens)
hrms_integration_log (sync logs)
```

Your registration system is ready to work once the backend is running! 🎉