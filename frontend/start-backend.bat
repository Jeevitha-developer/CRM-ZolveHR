@echo off
echo 🚀 Starting HRMS CRM Backend...
echo.

REM Check if we're in the right directory
if not exist "backend\package.json" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Navigate to backend
cd backend

REM Check if .env exists
if not exist ".env" (
    echo ❌ Error: .env file not found in backend directory
    echo Please create a .env file with your database credentials
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)

REM Initialize database
echo 🏗️ Initializing database...
node scripts/init-database.js

REM Start the server
echo 🚀 Starting backend server...
npm start